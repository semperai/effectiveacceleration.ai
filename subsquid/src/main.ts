// main.js
// This is the main executable of the squid indexer.
import { config } from 'dotenv';
config({
  debug: false,
  path: './.env.local',
});

import webPush from "web-push";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.log(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.",
    "These must match the same-named variables set in 'notifications' service"
  );
  process.exit(1);
}

// Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
  "https://effectiveacceleration.ai",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);


// EvmBatchProcessor is the class responsible for data retrieval and processing.
import { DataHandlerContext, EvmBatchProcessor } from "@subsquid/evm-processor";
// TypeormDatabase is the class responsible for data storage.
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";

import * as marketplaceAbi from "./abi/MarketplaceV1";
import * as marketplaceDataAbi from "./abi/MarketplaceDataV1";
import { Config } from "@effectiveacceleration/contracts";

import {
  JobEvent,
  Job,
  Marketplace,
  JobCreatedEvent,
  JobUpdatedEvent,
  JobSignedEvent,
  JobRatedEvent,
  JobDisputedEvent,
  JobArbitratedEvent,
  JobMessageEvent,
  JobRoles,
  Review,
  User,
  Arbitrator,
  PushSubscription,
  JobTimes,
  Notification,
} from "./model";
import {
  decodeJobArbitratedEvent,
  decodeJobCreatedEvent,
  decodeJobDisputedEvent,
  decodeJobMessageEvent,
  decodeJobRatedEvent,
  decodeJobSignedEvent,
  decodeJobUpdatedEvent,
  getFromIpfs,
  JobEventType,
  JobState,
} from "@effectiveacceleration/contracts";
import { getAddress, toBigInt, ZeroAddress, ZeroHash } from "ethers";
import JSON5 from "@mainnet-pat/json5-bigint";
import "@mainnet-pat/json5-bigint/lib/presets/extended";

// const MARKETPLACE_CONTRACT_ADDRESS =
//   "0x60a1561455c9Bd8fe6B0F05976d7F84ff2eff5a3".toLowerCase();
// const MARKETPLACEDATA_CONTRACT_ADDRESS =
//   "0xB43014F1328dd3732f60C06107F1b5a03eea60AF".toLowerCase();

const networkName = process.env.NETWORK ?? "Hardhat";
const RpcNetworkName = networkName.toUpperCase().replace(" ", "_");
const MARKETPLACE_CONTRACT_ADDRESS = Config(networkName).marketplaceAddress.toLowerCase();
const MARKETPLACEDATA_CONTRACT_ADDRESS = Config(networkName).marketplaceDataAddress.toLowerCase();

console.log("Using rpc endpoint:", process.env[`RPC_${RpcNetworkName}_HTTP`] ?? process.env.RPC_ENDPOINT);

// First we configure data retrieval.
const processor = new EvmBatchProcessor()
  // // SQD Network gateways are the primary source of blockchain data in
  // // squids, providing pre-filtered data in chunks of roughly 1-10k blocks.
  // // Set this for a fast sync.
  .setGateway(process.env.GATEWAY as any)
  // // Another data source squid processors can use is chain RPC.
  // // In this particular squid it is used to retrieve the very latest chain data
  // // (including unfinalized blocks) in real time. It can also be used to
  // //   - make direct RPC queries to get extra data during indexing
  // //   - sync a squid without a gateway (slow)
  .setRpcEndpoint(process.env[`RPC_${RpcNetworkName}_HTTP`] ?? process.env.RPC_ENDPOINT)
  // The processor needs to know how many newest blocks it should mark as "hot".
  // If it detects a blockchain fork, it will roll back any changes to the
  // database made due to orphaned blocks, then re-run the processing for the
  // main chain blocks.
  .setFinalityConfirmation(100)
  // .addXXX() methods request data items.
  // Other .addXXX() methods (.addTransaction(), .addTrace(), .addStateDiff()
  // on EVM) are similarly feature-rich.
  .addLog({
    address: [MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACEDATA_CONTRACT_ADDRESS],
    range: {
      from: process.env.BLOCK_FROM ? Number(process.env.BLOCK_FROM) : 0,
    },
  });

// TypeormDatabase objects store the data to Postgres. They are capable of
// handling the rollbacks that occur due to blockchain forks.
//
// There are also Database classes for storing data to files and BigQuery
// datasets.
const db = new TypeormDatabase({ supportHotBlocks: true });

// The processor.run() call executes the data processing. Its second argument is
// the handler function that is executed once on each batch of data. Processor
// object provides the data via "ctx.blocks". However, the handler can contain
// arbitrary TypeScript code, so it's OK to bring in extra data from IPFS,
// direct RPC calls, external APIs etc.
processor.run(db, async (ctx) => {
  // bluntly prevent excessive logs of HTTP 429 errors
  (ctx._chain.client as any).log = undefined;

  const jobCache: Record<string, Job> = {};
  const userCache: Record<string, User> = {};
  const arbitratorCache: Record<string, Arbitrator> = {};
  const eventList: JobEvent[] = [];
  const reviewList: Review[] = [];
  let marketplace: Marketplace | undefined;

  for (const block of ctx.blocks) {
    if (block.logs.length) {
      console.log("Processing block", block.header.height, block.logs.length);
    } else {
      continue;
    }

    for (const log of block.logs) {
      if (log.address === MARKETPLACE_CONTRACT_ADDRESS) {
        marketplace =
          marketplace ??
          (await ctx.store.findOneBy(Marketplace, {
            id: getAddress(MARKETPLACE_CONTRACT_ADDRESS),
          }))!;
        if (!marketplace) {
          marketplace = new Marketplace({
            id: getAddress(MARKETPLACE_CONTRACT_ADDRESS),
            marketplaceData: getAddress(MARKETPLACEDATA_CONTRACT_ADDRESS),
            paused: false,
            jobCount: 0,
            userCount: 0,
            arbitratorCount: 0,
          });
        }

        const eventIndex = Object.values(marketplaceAbi.events).findIndex(
          (event) => event.topic === log.topics[0]
        );
        if (eventIndex !== -1) {
          console.log(
            "Processing Marketplace Event Log:",
            Object.keys(marketplaceAbi.events)[eventIndex]
          );
        }
        switch (log.topics[0]) {
          case marketplaceAbi.events.Initialized.topic: {
            const { version } = marketplaceAbi.events.Initialized.decode(log);

            // TODO: workaround for currently deployed contracts, remove after upgrade
            if (process.env.GATEWAY?.includes("arbitrum")) {
              const contract = new marketplaceAbi.Contract(
                ctx,
                block.header,
                MARKETPLACE_CONTRACT_ADDRESS
              );
              try {
                const unicrowAddress = await contract.unicrowAddress();
                const unicrowDisputeAddress =
                  await contract.unicrowDisputeAddress();
                const unicrowArbitratorAddress =
                  await contract.unicrowArbitratorAddress();
                const treasuryAddress = await contract.treasuryAddress();
                const unicrowMarketplaceFee =
                  await contract.unicrowMarketplaceFee();
                const owner = await contract.owner();

                marketplace = new Marketplace({
                  id: getAddress(MARKETPLACE_CONTRACT_ADDRESS),
                  unicrowAddress: getAddress(unicrowAddress),
                  unicrowDisputeAddress: getAddress(unicrowDisputeAddress),
                  unicrowArbitratorAddress: getAddress(unicrowArbitratorAddress),
                  treasuryAddress: getAddress(treasuryAddress),
                  owner: getAddress(owner),
                  unicrowMarketplaceFee,
                  marketplaceData: getAddress(MARKETPLACEDATA_CONTRACT_ADDRESS),
                  paused: false,
                  jobCount: 0,
                  userCount: 0,
                  arbitratorCount: 0,
                });
              } catch (e) {
                const unicrowAddress = ZeroAddress;
                const unicrowDisputeAddress = ZeroAddress;
                const unicrowArbitratorAddress = ZeroAddress;
                const treasuryAddress = ZeroAddress;
                const owner = ZeroAddress;
                const unicrowMarketplaceFee = 0;

                marketplace = new Marketplace({
                  id: getAddress(MARKETPLACE_CONTRACT_ADDRESS),
                  unicrowAddress: getAddress(unicrowAddress),
                  unicrowDisputeAddress: getAddress(unicrowDisputeAddress),
                  unicrowArbitratorAddress: getAddress(unicrowArbitratorAddress),
                  treasuryAddress: getAddress(treasuryAddress),
                  owner: getAddress(owner),
                  unicrowMarketplaceFee,
                  marketplaceData: getAddress(MARKETPLACEDATA_CONTRACT_ADDRESS),
                  paused: false,
                  jobCount: 0,
                  userCount: 0,
                  arbitratorCount: 0,
                });
              }
            }

            marketplace.version = Number(version);

            break;
          }
          case marketplaceAbi.events.MarketplaceDataAddressChanged.topic: {
            const { marketplaceDataAddress } =
              marketplaceAbi.events.MarketplaceDataAddressChanged.decode(log);
            marketplace.marketplaceData = getAddress(marketplaceDataAddress);
            break;
          }
          case marketplaceAbi.events.TreasuryAddressChanged.topic: {
            const { treasuryAddress } =
              marketplaceAbi.events.TreasuryAddressChanged.decode(log);
            marketplace.treasuryAddress = getAddress(treasuryAddress);
            break;
          }
          case marketplaceAbi.events.UnicrowAddressesChanged.topic: {
            const {
              unicrowAddress,
              unicrowArbitratorAddress,
              unicrowDisputeAddress,
            } = marketplaceAbi.events.UnicrowAddressesChanged.decode(log);
            marketplace.unicrowAddress = getAddress(unicrowAddress);
            marketplace.unicrowArbitratorAddress = getAddress(unicrowArbitratorAddress);
            marketplace.unicrowDisputeAddress = getAddress(unicrowDisputeAddress);
            break;
          }
          case marketplaceAbi.events.UnicrowMarketplaceFeeChanged.topic: {
            const { unicrowMarketplaceFee } =
              marketplaceAbi.events.UnicrowMarketplaceFeeChanged.decode(log);
            marketplace.unicrowMarketplaceFee = unicrowMarketplaceFee;
            break;
          }
          case marketplaceAbi.events.VersionChanged.topic: {
            const { version } =
              marketplaceAbi.events.VersionChanged.decode(log);
            marketplace.version = Number(version);
            break;
          }
          case marketplaceAbi.events.Paused.topic: {
            marketplace.paused = true;
            break;
          }
          case marketplaceAbi.events.Unpaused.topic: {
            marketplace.paused = false;
            break;
          }
          case marketplaceAbi.events.OwnershipTransferred.topic: {
            const { newOwner } =
              marketplaceAbi.events.OwnershipTransferred.decode(log);
            marketplace.owner = getAddress(newOwner);
            break;
          }
          default:
            break;
        }
      } else if (log.address === MARKETPLACEDATA_CONTRACT_ADDRESS) {
        const eventIndex = Object.values(marketplaceDataAbi.events).findIndex(
          (event) => event.topic === log.topics[0]
        );
        if (eventIndex !== -1) {
          console.log(
            "Processing MarketplaceData Event Log:",
            Object.keys(marketplaceDataAbi.events)[eventIndex]
          );
        }

        switch (log.topics[0]) {
          case marketplaceDataAbi.events.UserRegistered.topic: {
            const userRegisteredEvent =
              marketplaceDataAbi.events.UserRegistered.decode(log);

            const user = new User({
              id: getAddress(userRegisteredEvent.addr),
              address_: getAddress(userRegisteredEvent.addr),
              publicKey: userRegisteredEvent.pubkey,
              name: userRegisteredEvent.name,
              bio: userRegisteredEvent.bio,
              avatar: userRegisteredEvent.avatar,
              reputationUp: 0,
              reputationDown: 0,
              averageRating: 0,
              numberOfReviews: 0,
              myReviews: [],
              reviews: [],
              timestamp: Math.floor(log.block.timestamp / 1000),
            });

            userCache[getAddress(userRegisteredEvent.addr)] = user;

            marketplace =
              marketplace ??
              await ctx.store.findOneByOrFail(Marketplace, {
                id: getAddress(MARKETPLACE_CONTRACT_ADDRESS),
              });
            marketplace!.userCount += 1;
            break;
          }
          case marketplaceDataAbi.events.UserUpdated.topic: {
            const userUpdatedEvent =
              marketplaceDataAbi.events.UserUpdated.decode(log);

            const userId = getAddress(userUpdatedEvent.addr);
            const user =
              userCache[userId] ??
              (await ctx.store.findOneByOrFail(User, {
                id: userId,
              }))!;
            userCache[userId] = user;

            user.name = userUpdatedEvent.name;
            user.bio = userUpdatedEvent.bio;
            user.avatar = userUpdatedEvent.avatar;

            userCache[userId] = user;
            break;
          }
          case marketplaceDataAbi.events.ArbitratorRegistered.topic: {
            const arbitratorRegisteredEvent =
              marketplaceDataAbi.events.ArbitratorRegistered.decode(log);

            const arbitrator = new Arbitrator({
              id: getAddress(arbitratorRegisteredEvent.addr),
              address_: getAddress(arbitratorRegisteredEvent.addr),
              publicKey: arbitratorRegisteredEvent.pubkey,
              name: arbitratorRegisteredEvent.name,
              bio: arbitratorRegisteredEvent.bio,
              avatar: arbitratorRegisteredEvent.avatar,
              fee: arbitratorRegisteredEvent.fee,
              refusedCount: 0,
              settledCount: 0,
              timestamp: Math.floor(log.block.timestamp / 1000),
            });

            arbitratorCache[getAddress(arbitratorRegisteredEvent.addr)] = arbitrator;

            marketplace =
              marketplace ??
              await ctx.store.findOneByOrFail(Marketplace, {
                id: getAddress(MARKETPLACE_CONTRACT_ADDRESS),
              });
            marketplace!.arbitratorCount += 1;
            break;
          }
          case marketplaceDataAbi.events.ArbitratorUpdated.topic: {
            const arbitratorUpdatedEvent =
              marketplaceDataAbi.events.ArbitratorUpdated.decode(log);

            const arbitrator =
              arbitratorCache[getAddress(arbitratorUpdatedEvent.addr)] ??
              (await ctx.store.findOneByOrFail(Arbitrator, {
                id: getAddress(arbitratorUpdatedEvent.addr),
              }))!;
            arbitratorCache[getAddress(arbitratorUpdatedEvent.addr)] = arbitrator;

            arbitrator.name = arbitratorUpdatedEvent.name;
            arbitrator.bio = arbitratorUpdatedEvent.bio;
            arbitrator.avatar = arbitratorUpdatedEvent.avatar;

            arbitratorCache[getAddress(arbitratorUpdatedEvent.addr)] = arbitrator;
            break;
          }
          case marketplaceDataAbi.events.JobEvent.topic: {
            const decoded = marketplaceDataAbi.events.JobEvent.decode(log);

            const jobId = decoded.jobId.toString();
            console.log(
              "Processing Job Event Type:",
              JobEventType[decoded.eventData.type_],
              "jobId:",
              jobId
            );
            let job: Job =
              jobCache[jobId] ??
              (await ctx.store.findOneBy(Job, { id: jobId }))!;
            jobCache[jobId] = job;

            const event = decoded.eventData;
            const jobEvent = new JobEvent({
              address_: decoded.eventData.address_ === "0x" ? decoded.eventData.address_ : getAddress(decoded.eventData.address_),
              data_: decoded.eventData.data_,
              timestamp_: decoded.eventData.timestamp_,
              type_: decoded.eventData.type_,
              job: new Job({ id: decoded.jobId.toString() }),
              jobId: decoded.jobId,
              id: log.id,
            });

            switch (Number(event.type_)) {
              case JobEventType.Created: {
                const jobCreated = decodeJobCreatedEvent(event.data_);

                if (!job) {
                  job = new Job({
                    roles: new JobRoles({
                      creator: ZeroAddress,
                      worker: ZeroAddress,
                      arbitrator: ZeroAddress,
                    }),
                  });

                  job.id = jobId;
                  job.title = jobCreated.title;
                  job.contentHash = jobCreated.contentHash;
                  try {
                    job.content = await getFromIpfs(job.contentHash);
                  } catch {
                    job.content = "";
                  }
                  job.multipleApplicants = jobCreated.multipleApplicants;
                  job.tags = jobCreated.tags;
                  job.token = getAddress(jobCreated.token);
                  job.amount = jobCreated.amount;
                  job.maxTime = jobCreated.maxTime;
                  job.deliveryMethod = jobCreated.deliveryMethod;
                  job.roles.arbitrator = getAddress(jobCreated.arbitrator);
                  job.whitelistWorkers = jobCreated.whitelistWorkers;

                  // defaults
                  job.collateralOwed = 0n;
                  job.disputed = false;
                  job.state = JobState.Open;
                  job.escrowId = 0n;
                  job.rating = 0;
                  job.roles.creator = getAddress(event.address_);
                  job.roles.worker = ZeroAddress;
                  job.timestamp = event.timestamp_;
                  job.resultHash = ZeroHash;
                  job.allowedWorkers = [];
                  job.eventCount = 0;
                  job.events = [];
                  job.jobTimes = new JobTimes({
                    createdAt: event.timestamp_,
                    openedAt: event.timestamp_,
                    lastEventAt: event.timestamp_,

                    arbitratedAt: 0,
                    closedAt: 0,
                    assignedAt: 0,
                    disputedAt: 0,
                    updatedAt: 0,
                  });
                }
                jobCache[jobId] = job;

                jobEvent.details = new JobCreatedEvent(jobCreated);

                if (job.roles.arbitrator !== ZeroAddress) {
                  await handleNotification(job.roles.arbitrator, jobEvent, ctx);
                }

                marketplace =
                  marketplace ??
                  await ctx.store.findOneByOrFail(Marketplace, {
                    id: getAddress(MARKETPLACE_CONTRACT_ADDRESS),
                  });
                marketplace!.jobCount += 1;
                break;
              }
              case JobEventType.Taken: {
                if (!job) {
                  throw new Error("Job must be created before it can be taken");
                }

                job.roles.worker = getAddress(event.address_);
                job.state = JobState.Taken;
                job.escrowId = toBigInt(event.data_);
                job.jobTimes.assignedAt = event.timestamp_;

                await handleNotification(job.roles.creator, jobEvent, ctx);

                break;
              }
              case JobEventType.Paid: {
                if (!job) {
                  throw new Error("Job must be created before it can be paid");
                }

                job.roles.worker = getAddress(event.address_);
                job.state = JobState.Taken;
                job.escrowId = toBigInt(event.data_);
                job.jobTimes.assignedAt = event.timestamp_;

                await handleNotification(job.roles.worker, jobEvent, ctx);

                break;
              }
              case JobEventType.Updated: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be updated"
                  );
                }

                const oldArbitrator = job.roles.arbitrator;
                const arbitratorChanged = event.address_.toLowerCase() !== job.roles.arbitrator.toLowerCase();

                const jobUpdated = decodeJobUpdatedEvent(event.data_);
                job.title = jobUpdated.title;
                job.contentHash = jobUpdated.contentHash;
                job.tags = jobUpdated.tags;
                job.maxTime = jobUpdated.maxTime;
                job.roles.arbitrator = getAddress(jobUpdated.arbitrator);
                job.whitelistWorkers = jobUpdated.whitelistWorkers;
                job.jobTimes.updatedAt = event.timestamp_;

                jobEvent.details = new JobUpdatedEvent(jobUpdated);

                if (job.amount !== jobUpdated.amount) {
                  if (jobUpdated.amount > job.amount) {
                    job.collateralOwed = 0n; // Clear the collateral record
                  } else {
                    const difference = job.amount - jobUpdated.amount;

                    if (
                      Number(event.timestamp_) >=
                      Number(job.timestamp) + 60 * 60 * 24
                    ) {
                      job.collateralOwed = 0n; // Clear the collateral record
                    } else {
                      job.collateralOwed += difference; // Record to owe later
                    }
                  }

                  job.amount = jobUpdated.amount;
                }

                await handleNotification(job.roles.worker, jobEvent, ctx);
                if (arbitratorChanged) {
                  await Promise.all([
                    handleNotification(oldArbitrator, jobEvent, ctx),
                    handleNotification(job.roles.arbitrator, jobEvent, ctx),
                  ]);
                }

                break;
              }
              case JobEventType.Signed: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be signed"
                  );
                }

                const jobSigned = decodeJobSignedEvent(event.data_);
                jobEvent.details = new JobSignedEvent(jobSigned);

                await handleNotification(job.roles.creator, jobEvent, ctx);

                break;
              }
              case JobEventType.Completed: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be completed"
                  );
                }

                job.state = JobState.Closed;
                job.jobTimes.closedAt = event.timestamp_;

                await handleNotification(job.roles.worker, jobEvent, ctx);
                if (job.roles.arbitrator !== ZeroAddress) {
                  await handleNotification(job.roles.arbitrator, jobEvent, ctx);
                }

                break;
              }
              case JobEventType.Delivered: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be delivered"
                  );
                }

                job.resultHash = event.data_;

                const userId = job.roles.worker;
                const user: User =
                  userCache[userId] ??
                  (await ctx.store.findOneByOrFail(User, { id: userId }))!;
                user.reputationUp++;
                userCache[userId] = user;

                await handleNotification(job.roles.creator, jobEvent, ctx);

                break;
              }
              case JobEventType.Closed: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be closed"
                  );
                }

                job.state = JobState.Closed;
                job.jobTimes.closedAt = event.timestamp_;
                if (
                  Number(event.timestamp_) >=
                  Number(job.timestamp) + 60 * 60 * 24
                ) {
                  job.collateralOwed = 0n; // Clear the collateral record
                } else {
                  job.collateralOwed += job.amount;
                }

                break;
              }
              case JobEventType.Reopened: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be reopened"
                  );
                }

                job.state = JobState.Open;
                job.resultHash = ZeroHash;
                job.timestamp = event.timestamp_;
                job.jobTimes.openedAt = event.timestamp_;

                if (job.collateralOwed < job.amount) {
                  job.collateralOwed = 0n;
                } else {
                  job.collateralOwed -= job.amount;
                }

                break;
              }
              case JobEventType.Rated: {
                if (!job) {
                  throw new Error("Job must be created before it can be rated");
                }

                const jobRated = decodeJobRatedEvent(event.data_);
                jobEvent.details = new JobRatedEvent(jobRated);
                job.rating = jobRated.rating;

                const userId = job.roles.worker;
                let user: User =
                  userCache[userId] ??
                  (await ctx.store.findOneByOrFail(User, { id: userId }))!;

                user.averageRating = Math.floor(
                  (user.averageRating * user.numberOfReviews +
                    jobRated.rating * 10000) /
                  (user.numberOfReviews + 1)
                );
                user.numberOfReviews++;

                userCache[userId] = user;

                reviewList.push(
                  new Review({
                    id: log.id,
                    rating: jobRated.rating,
                    jobId: decoded.jobId,
                    text: jobRated.review,
                    timestamp: event.timestamp_,
                    user: job.roles.worker,
                    reviewer: job.roles.creator,
                    userLoaded: new User({ id: job.roles.worker }),
                    reviewerLoaded: new User({ id: job.roles.creator }),
                  })
                );

                await handleNotification(job.roles.worker, jobEvent, ctx);

                break;
              }
              case JobEventType.Refunded: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be refunded"
                  );
                }

                const byWorker = event.address_.toLowerCase() === job.roles.worker.toLowerCase();
                if (byWorker) {
                  job.allowedWorkers = job.allowedWorkers.filter(
                    (address) => address !== job!.roles.worker
                  );

                  const userId = job.roles.worker;
                  const user: User =
                    userCache[userId] ??
                    (await ctx.store.findOneByOrFail(User, { id: userId }))!;
                  user.reputationDown++;
                  userCache[userId] = user;
                }

                job.roles.worker = ZeroAddress;
                job.state = JobState.Open;
                job.escrowId = 0n;
                job.disputed = false;
                job.jobTimes.openedAt = event.timestamp_;

                await handleNotification(job.roles.creator, jobEvent, ctx);

                break;
              }
              case JobEventType.Disputed: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be disputed"
                  );
                }

                const jobDisputed = decodeJobDisputedEvent(event.data_);
                jobEvent.details = new JobDisputedEvent(jobDisputed);
                job.disputed = true;
                job.jobTimes.disputedAt = event.timestamp_;

                const byWorker = event.address_.toLowerCase() === job.roles.worker.toLowerCase();

                await Promise.all([
                  handleNotification(byWorker ? job.roles.creator : job.roles.worker, jobEvent, ctx),
                  handleNotification(job.roles.arbitrator, jobEvent, ctx),
                ]);

                break;
              }
              case JobEventType.Arbitrated: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be arbitrated"
                  );
                }

                const jobArbitrated = decodeJobArbitratedEvent(event.data_);
                jobEvent.details = new JobArbitratedEvent(jobArbitrated);
                job.state = JobState.Closed;
                job.collateralOwed = job.collateralOwed +=
                  jobArbitrated.creatorAmount;
                job.disputed = false;
                job.jobTimes.arbitratedAt = event.timestamp_;
                job.jobTimes.closedAt = event.timestamp_;

                const arbitrator =
                  arbitratorCache[job.roles.arbitrator] ??
                  (await ctx.store.findOneByOrFail(Arbitrator, {
                    id: job.roles.arbitrator,
                  }))!;
                arbitratorCache[job.roles.arbitrator] = arbitrator;
                arbitrator.settledCount++;

                await Promise.all([
                  handleNotification(job.roles.creator, jobEvent, ctx),
                  handleNotification(job.roles.worker, jobEvent, ctx),
                ]);

                break;
              }
              case JobEventType.ArbitrationRefused: {
                if (!job) {
                  throw new Error(
                    "Job must be created before it can be refused arbitration"
                  );
                }

                const arbitrator =
                  arbitratorCache[job.roles.arbitrator] ??
                  (await ctx.store.findOneByOrFail(Arbitrator, {
                    id: job.roles.arbitrator,
                  }))!;
                arbitratorCache[job.roles.arbitrator] = arbitrator;
                arbitrator.refusedCount++;

                job.roles.arbitrator = ZeroAddress;

                await handleNotification(job.roles.creator, jobEvent, ctx);
                if (job.roles.worker !== ZeroAddress) {
                  await handleNotification(job.roles.worker, jobEvent, ctx);
                }

                break;
              }
              case JobEventType.WhitelistedWorkerAdded: {
                if (!job) {
                  throw new Error(
                    "Job must be created before workers can be whitelisted"
                  );
                }

                job.allowedWorkers.push(getAddress(event.address_));

                await handleNotification(getAddress(event.address_), jobEvent, ctx);

                break;
              }
              case JobEventType.WhitelistedWorkerRemoved: {
                if (!job) {
                  throw new Error(
                    "Job must be created before workers can be whitelisted"
                  );
                }

                job.allowedWorkers = job.allowedWorkers.filter(
                  (address) => address !== getAddress(event.address_)
                );

                await handleNotification(getAddress(event.address_), jobEvent, ctx);

                break;
              }
              case JobEventType.CollateralWithdrawn: {
                if (!job) {
                  throw new Error(
                    "Job must be created before collateral can be withdrawn"
                  );
                }

                job.collateralOwed = 0n;

                break;
              }
              case JobEventType.OwnerMessage:
              case JobEventType.WorkerMessage: {
                if (!job) {
                  throw new Error(
                    "Job must be created before messages can be exchanged"
                  );
                }

                const jobMessage = decodeJobMessageEvent(event.data_);
                jobEvent.details = new JobMessageEvent(jobMessage);

                await handleNotification(jobEvent.details.recipientAddress, jobEvent, ctx);

                break;
              }
              default:
                break;
            }

            job.eventCount += 1;
            job.lastJobEvent = jobEvent;
            job.jobTimes.lastEventAt = event.timestamp_;
            eventList.push(jobEvent);
            break;
          }
          default:
            break;
        }
      }
    }
  }

  if (marketplace) {
    await ctx.store.upsert(marketplace);
  }

  await ctx.store.upsert(Object.values(userCache));
  await ctx.store.upsert(Object.values(arbitratorCache));
  await ctx.store.upsert(Object.values(jobCache));
  await ctx.store.upsert(eventList);
  await ctx.store.upsert(reviewList);
});

// inserts a notification into the database and sends a web push notification
const handleNotification = async (address: string, event: JobEvent, ctx: DataHandlerContext<Store, {}>): Promise<void> => {
  // insert the notification into the database
  await ctx.store.upsert(new Notification({
    id: event.id,
    address: address,
    jobId: String(event.jobId),
    type: event.type_,
    timestamp: event.timestamp_,
  }));

  // send a push notification
  if (!ctx.isHead) {
    // do not send push notifications while (re)-syncing
    return;
  }

  if (address === ZeroAddress) {
    // do not even bother to query db for zero address
    return;
  }

  const subscriptions = await ctx.store.findBy(PushSubscription, { address });
  await Promise.all(subscriptions.map(async (subscription) => {
    // strip raw and decoded data not to exceed the payload max size of 4028 bytes
    const payload = JSON5.stringify({
      id: event.id,
      jobId: event.jobId,
      type_: event.type_,
      address_: event.address_,
      timestamp_: event.timestamp_,
    });
    const options: webPush.RequestOptions = {
      timeout: 10 * 1000, // 10 seconds to fail the request
      TTL: 10 * 60, // 10 minutes to store our message on the push server
    };


    const tries = 5;
    for (const i of [...Array(tries).keys()].slice(1)) {
      try {
        await webPush.sendNotification(subscription, payload, options);
        console.log(`Push notification sent for address: ${address}, job: ${event.jobId}, event: ${event.id}`);
        break;
      } catch (e: any) {
        // trhottle the retries
        if ([503, 201, 202, 429].includes(e.statusCode)) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 1.5 ** i));
        }

        // invalid/expired subscription
        if ([404, 102, 410, 103, 105, 106].includes(e.statusCode)) {
          await ctx.store.remove(subscription);
          console.error(`Removing subscription due to error: ${e.message}: ${e.statusCode}`);
          break;
        }

        if (i === tries) {
          console.error(`Failed to send push notification for address: ${address}, job: ${event.jobId}, event: ${event.id}. Error: ${e.message}: ${e.statusCode}`);
        }
      }
    }
  }));
}