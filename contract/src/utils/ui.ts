import { toBigInt, getAddress, ZeroAddress, ZeroHash } from "ethers";
import { Job, JobArbitratedEvent, JobCreatedEvent, JobDisputedEvent, JobEvent, JobEventType, JobEventWithDiffs, JobMessageEvent, JobState, JobUpdatedEvent } from "../interfaces";
import { safeGetFromIpfs } from "./encryption";
import { decodeJobCreatedEvent, decodeJobUpdatedEvent, decodeJobSignedEvent, decodeJobRatedEvent, decodeJobArbitratedEvent, decodeJobMessageEvent, decodeJobDisputedEvent, decryptJobDisputedEvent } from "./decodeEvents";

export const computeJobStateDiffs = (jobEvents: JobEvent[], jobId: bigint, job?: Job): JobEventWithDiffs[] => {
  const result: JobEventWithDiffs[] = [];

  let previousJobState: Job | undefined = job;
  let id = 0n;
  for (const event of jobEvents) {
    event.id = id++;
    switch (Number(event.type_)) {
      case JobEventType.Created: {
        const jobCreated = decodeJobCreatedEvent(event.data_);

        if (!job) {
          job = {roles:{}} as Job;
          job.id = jobId;
          job.title = jobCreated.title;
          job.contentHash = jobCreated.contentHash as `0x${string}`;
          job.multipleApplicants = jobCreated.multipleApplicants;
          job.tags = jobCreated.tags;
          job.token = jobCreated.token as `0x${string}`;
          job.amount = jobCreated.amount;
          job.maxTime = jobCreated.maxTime;
          job.deliveryMethod = jobCreated.deliveryMethod;
          job.roles.arbitrator = jobCreated.arbitrator as `0x${string}`;
          job.whitelistWorkers = jobCreated.whitelistWorkers;

          // defaults
          job.collateralOwed = 0n;
          job.disputed = false;
          job.state = JobState.Open;
          job.escrowId = 0n;
          job.rating = 0;
          job.roles.creator = getAddress(event.address_) as `0x${string}`;
          job.roles.worker = ZeroAddress as `0x${string}`;
          job.timestamp = event.timestamp_;
          job.resultHash = ZeroHash as `0x${string}`;
          job.allowedWorkers = [];
        }

        event.details = jobCreated;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "title", oldValue: undefined, newValue: job.title },
            { field: "contentHash", oldValue: undefined, newValue: job.contentHash },
            { field: "multipleApplicants", oldValue: undefined, newValue: job.multipleApplicants },
            { field: "tags", oldValue: undefined, newValue: job.tags },
            { field: "token", oldValue: undefined, newValue: job.token },
            { field: "amount", oldValue: undefined, newValue: job.amount },
            { field: "maxTime", oldValue: undefined, newValue: job.maxTime },
            { field: "deliveryMethod", oldValue: undefined, newValue: job.deliveryMethod },
            { field: "arbitrator", oldValue: undefined, newValue: job.roles.arbitrator },
            { field: "allowedWorkers", oldValue: undefined, newValue: job.allowedWorkers },
            { field: "whitelistWorkers", oldValue: undefined, newValue: job.whitelistWorkers },

            // defaults
            { field: "collateralOwed", oldValue: undefined, newValue: job.collateralOwed },
            { field: "disputed", oldValue: undefined, newValue: job.disputed },
            { field: "state", oldValue: undefined, newValue: job.state },
            { field: "escrowId", oldValue: undefined, newValue: job.escrowId },
            { field: "rating", oldValue: undefined, newValue: job.rating },
            { field: "roles.creator", oldValue: undefined, newValue: job.roles.creator },
            { field: "roles.worker", oldValue: undefined, newValue: job.roles.worker },
            { field: "timestamp", oldValue: undefined, newValue: job.timestamp },
            { field: "resultHash", oldValue: undefined, newValue: job.resultHash },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Taken: {
        if (!job) {
          throw new Error("Job must be created before it can be taken");
        }

        job.roles.worker = getAddress(event.address_) as `0x${string}`;
        job.state = JobState.Taken;
        job.escrowId = toBigInt(event.data_);

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
            { field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Paid: {
        if (!job) {
          throw new Error("Job must be created before it can be paid");
        }

        job.roles.worker = getAddress(event.address_) as `0x${string}`;
        job.state = JobState.Taken;
        job.escrowId = toBigInt(event.data_);

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
            { field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Updated: {
        if (!job) {
          throw new Error("Job must be created before it can be updated");
        }

        const jobUpdated = decodeJobUpdatedEvent(event.data_);
        job.title = jobUpdated.title;
        job.contentHash = jobUpdated.contentHash as `0x${string}`;
        job.tags = jobUpdated.tags;
        job.maxTime = jobUpdated.maxTime;
        job.roles.arbitrator = jobUpdated.arbitrator as `0x${string}`;
        job.whitelistWorkers = jobUpdated.whitelistWorkers;

        event.details = jobUpdated;

        if (job.amount !== jobUpdated.amount) {
          if (jobUpdated.amount > job.amount) {
            job.collateralOwed = 0n; // Clear the collateral record
          } else {
            const difference = job.amount - jobUpdated.amount;

            if (Number(event.timestamp_) >= Number(job.timestamp) + 60 * 60 * 24) {
              job.collateralOwed = 0n; // Clear the collateral record
            } else {
              job.collateralOwed += difference; // Record to owe later
            }
          }

          job.amount = jobUpdated.amount;
        }

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            ...(previousJobState?.title !== job.title ? [{ field: "title", oldValue: previousJobState?.title, newValue: job.title }] : []),
            ...(previousJobState?.contentHash !== job.contentHash ? [{ field: "contentHash", oldValue: previousJobState?.contentHash, newValue: job.contentHash }] : []),
            ...(previousJobState?.tags !== job.tags ? [{ field: "tags", oldValue: previousJobState?.tags, newValue: job.tags }] : []),
            ...(previousJobState?.amount !== job.amount ? [{ field: "amount", oldValue: previousJobState?.amount, newValue: job.amount }] : []),
            ...(previousJobState?.maxTime !== job.maxTime ? [{ field: "maxTime", oldValue: previousJobState?.maxTime, newValue: job.maxTime }] : []),
            ...(previousJobState?.roles.arbitrator !== job.roles.arbitrator ? [{ field: "roles.arbitrator", oldValue: previousJobState?.roles.arbitrator, newValue: job.roles.arbitrator }] : []),
            ...(previousJobState?.whitelistWorkers !== job.whitelistWorkers ? [{ field: "whitelistWorkers", oldValue: previousJobState?.whitelistWorkers, newValue: job.whitelistWorkers }] : []),
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Signed: {
        if (!job) {
          throw new Error("Job must be created before it can be signed");
        }

        const jobSigned = decodeJobSignedEvent(event.data_);
        event.details = jobSigned;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Completed: {
        if (!job) {
          throw new Error("Job must be created before it can be completed");
        }

        job.state = JobState.Closed;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Delivered: {
        if (!job) {
          throw new Error("Job must be created before it can be delivered");
        }

        job.resultHash = event.data_;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "resultHash", oldValue: previousJobState?.resultHash, newValue: job.resultHash },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Closed: {
        if (!job) {
          throw new Error("Job must be created before it can be closed");
        }

        job.state = JobState.Closed;
        if (Number(event.timestamp_) >= Number(job.timestamp) + 60 * 60 * 24) {
          job.collateralOwed = 0n; // Clear the collateral record
        } else {
          job.collateralOwed += job.amount;
        }

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Reopened: {
        if (!job) {
          throw new Error("Job must be created before it can be reopened");
        }

        job.state = JobState.Open;
        job.resultHash = ZeroHash as `0x${string}`;
        job.timestamp  = event.timestamp_;

        if (job.collateralOwed < job.amount) {
            job.collateralOwed = 0n;
        } else {
            job.collateralOwed -= job.amount;
        }


        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.resultHash !== job.resultHash ? [{ field: "resultHash", oldValue: previousJobState?.resultHash, newValue: job.resultHash }] : []),
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
            { field: "timestamp", oldValue: previousJobState?.timestamp, newValue: job.timestamp },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Rated: {
        if (!job) {
          throw new Error("Job must be created before it can be rated");
        }

        const jobRated = decodeJobRatedEvent(event.data_);
        event.details = jobRated;
        job.rating = jobRated.rating;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "rating", oldValue: previousJobState?.rating, newValue: jobRated.rating },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Refunded: {
        if (!job) {
          throw new Error("Job must be created before it can be refunded");
        }

        job.state = JobState.Open;
        job.escrowId = 0n;
        job.allowedWorkers = job.allowedWorkers?.filter(address => address !== job!.roles.worker);
        job.roles.worker = ZeroAddress as `0x${string}`;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.escrowId !== job.escrowId ? [{ field: "escrowId", oldValue: previousJobState?.escrowId, newValue: job.escrowId }] : []),
            { field: "roles.worker", oldValue: previousJobState?.roles.worker, newValue: job.roles.worker },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Disputed: {
        if (!job) {
          throw new Error("Job must be created before it can be disputed");
        }

        const jobDisputed = decodeJobDisputedEvent(event.data_);
        event.details = jobDisputed;
        job.disputed = true;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "disputed", oldValue: previousJobState?.disputed, newValue: job.disputed },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.Arbitrated: {
        if (!job) {
          throw new Error("Job must be created before it can be arbitrated");
        }

        const jobArbitrated = decodeJobArbitratedEvent(event.data_);
        event.details = jobArbitrated;
        job.state = JobState.Closed;
        job.collateralOwed = job.collateralOwed += jobArbitrated.creatorAmount;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "state", oldValue: previousJobState?.state, newValue: job.state },
            ...(previousJobState?.collateralOwed !== job.collateralOwed ? [{ field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed }] : []),
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.ArbitrationRefused: {
        if (!job) {
          throw new Error("Job must be created before it can be refused arbitration");
        }

        job.roles.arbitrator = ZeroAddress as `0x${string}`;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "roles.arbitrator", oldValue: previousJobState?.roles.arbitrator, newValue: job.roles.arbitrator },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.WhitelistedWorkerAdded: {
        if (!job) {
          throw new Error("Job must be created before workers can be whitelisted");
        }

        job.allowedWorkers?.push(getAddress(event.address_));

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "allowedWorkers", oldValue: previousJobState?.allowedWorkers, newValue: job.allowedWorkers },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.WhitelistedWorkerRemoved: {
        if (!job) {
          throw new Error("Job must be created before workers can be whitelisted");
        }

        job.allowedWorkers = job.allowedWorkers?.filter(address => address !== getAddress(event.address_) as `0x${string}`);

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "allowedWorkers", oldValue: previousJobState?.allowedWorkers, newValue: job.allowedWorkers },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.CollateralWithdrawn: {
        if (!job) {
          throw new Error("Job must be created before collateral can be withdrawn");
        }

        job.collateralOwed = 0n;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
            { field: "collateralOwed", oldValue: previousJobState?.collateralOwed, newValue: job.collateralOwed },
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      case JobEventType.OwnerMessage:
      case JobEventType.WorkerMessage: {
        if (!job) {
          throw new Error("Job must be created before messages can be exchanged");
        }

        const jobMessage = decodeJobMessageEvent(event.data_);
        event.details = jobMessage;

        result.push({
          ...event,
          job: structuredClone(job),
          diffs: [
          ],
        });

        previousJobState = structuredClone(job);

        break;
      }
      default:
        break;
    }
  }

  return result;
}

export const fetchEventContents = async (events: JobEventWithDiffs[], sessionKeys: Record<string, string>): Promise<JobEventWithDiffs[]> => {
  const result = structuredClone(events);

  const contents: Record<string, string> = {};

  const workerCandidates: Set<string> = new Set<string>;

  await Promise.allSettled(result.filter((jobEvent) => [JobEventType.OwnerMessage, JobEventType.WorkerMessage, JobEventType.Arbitrated, JobEventType.Delivered, JobEventType.Created, JobEventType.Updated].includes(Number(jobEvent.type_))).map((jobEvent) => {
    if (Number(jobEvent.type_) === JobEventType.Created) {
      return {
        contentHash: (jobEvent.details as JobCreatedEvent).contentHash,
        sessionKey: undefined
      };
    } else if (Number(jobEvent.type_) === JobEventType.Updated) {
      return {
        contentHash: (jobEvent.details as JobUpdatedEvent).contentHash,
        sessionKey: undefined
      };
    } else if (Number(jobEvent.type_) === JobEventType.Arbitrated) {
      const details = jobEvent.details as JobArbitratedEvent;
      const key = `${jobEvent.job.roles.creator}-${jobEvent.job.roles.worker}`;
      return {
        contentHash: details.reasonHash,
        sessionKey: sessionKeys[key]
      };
    } else if (Number(jobEvent.type_) === JobEventType.Delivered) {
      const key = `${jobEvent.job.roles.worker}-${jobEvent.job.roles.creator}`;
      return {
        contentHash: jobEvent.data_,
        sessionKey: sessionKeys[key]
      };
    }

    const details = jobEvent.details as JobMessageEvent;
    const ownerMessage = getAddress(jobEvent.address_) === jobEvent.job.roles.creator;
    if (!ownerMessage) {
      workerCandidates.add(getAddress(jobEvent.address_));
    }

    if (jobEvent.job.roles.worker !== ZeroAddress) {
      return {
        contentHash: details.contentHash,
        sessionKey: sessionKeys[`${jobEvent.job.roles.creator}-${jobEvent.job.roles.worker}`]
      };
    }

    const pairs = [...workerCandidates].map(workerAddress => ({
      contentHash: details.contentHash,
      sessionKey: sessionKeys[`${workerAddress}-${jobEvent.job.roles.creator}`]
    }));
    return pairs;
  }).flat(1).map(async ({contentHash, sessionKey}) => {
    const badResponses = ["<encrypted message>"];
    try {
      const content = await safeGetFromIpfs(contentHash, sessionKey);
      if (!badResponses.includes(content)) {
        contents[contentHash] = content;
      }
    } catch {
      contents[contentHash] = "Error: Failed to fetch data";
    }

    return contents[contentHash];
  }));

  let previousState: JobEventWithDiffs | undefined = undefined;
  for (const event of result) {
    if (Number(event.type_) === JobEventType.Arbitrated) {
      (event.details as JobArbitratedEvent).reason = contents[(event.details as JobArbitratedEvent).reasonHash]
    } else if ([JobEventType.OwnerMessage, JobEventType.WorkerMessage].includes(Number(event.type_))) {
      (event.details as JobMessageEvent).content = contents[(event.details as JobMessageEvent).contentHash];
    } else if (Number(event.type_) === JobEventType.Delivered) {
      event.diffs.push({
        field: "result", oldValue: previousState?.job.result, newValue: contents[event.job.resultHash]
      });
    } else if (Number(event.type_) === JobEventType.Updated && event.job.contentHash !== (previousState?.job.contentHash ?? ZeroHash)) {
      event.diffs.push({
        field: "content", oldValue: previousState?.job.content, newValue: contents[event.job.contentHash]
      });
    } else if (Number(event.type_) === JobEventType.Disputed) {
      const details = event.details as JobDisputedEvent;
      const initiator = getAddress(event.address_);
      const arbitrator = event.job.roles.arbitrator;
      const key = `${initiator}-${arbitrator}`;
      decryptJobDisputedEvent(details, sessionKeys[key]);
    }

    if (event.job.contentHash !== (previousState?.job.contentHash ?? ZeroHash)) {
      event.job.content = contents[event.job.contentHash];
    } else {
      event.job.content = previousState?.job.content;
    }
    if (event.job.resultHash !== (previousState?.job.resultHash ?? ZeroHash)) {
      event.job.result = contents[event.job.resultHash];
    } else {
      event.job.result = previousState?.job.result;
    }

    previousState = structuredClone(event);
  }

  return result;
}
