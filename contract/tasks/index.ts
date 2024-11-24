import * as fs from 'fs';
import { MarketplaceV1 as Marketplace } from '../typechain-types/contracts/MarketplaceV1';
import { MarketplaceDataV1 as MarketplaceData } from '../typechain-types/contracts/MarketplaceDataV1';
import { FakeToken } from '../typechain-types/contracts/unicrow/FakeToken';
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { task } from "hardhat/config";
import Config from '../scripts/config.json';
import LocalConfig from '../scripts/config.local.json';
import { AbiCoder, getBytes, hexlify, keccak256, ZeroAddress } from 'ethers';
import {
  getEncryptionSigningKey,
  getFromIpfs,
  publishToIpfs,
  getSessionKey,
  encryptUtf8Data,
  encryptBinaryData,
  hashToCid,
} from '../src/utils/encryption';
import { decodeCustomJobEvent } from '../src/utils/decodeEvents';
import { JobEventType, jobEventTypeToString } from '../src/interfaces';
import "@nomicfoundation/hardhat-ethers";
import { base58 } from '@scure/base';
import yesno from 'yesno';


async function getMarketplace(hre: HardhatRuntimeEnvironment) {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");

  if (hre.network.name === 'hardhat') {
    console.log('You are on hardhat network, try localhost');
    process.exit(1);
  }

  if (hre.network.name === 'localhost') {
    const marketplace = await Marketplace.attach(LocalConfig.marketplaceAddress);
    return marketplace;
  }

  if (hre.network.name === 'arbitrum') {
    const marketplace = await Marketplace.attach(Config.marketplaceAddress);
    return marketplace;
  }

  console.log(`Unknown network ${hre.network.name}`);
  process.exit(1);
}

async function getMarketplaceData(hre: HardhatRuntimeEnvironment) {
  const MarketplaceData = await hre.ethers.getContractFactory("MarketplaceDataV1");

  if (hre.network.name === 'hardhat') {
    console.log('You are on hardhat network, try localhost');
    process.exit(1);
  }

  if (hre.network.name === 'localhost') {
    const marketplaceData = await MarketplaceData.attach(LocalConfig.marketplaceDataAddress);
    return marketplaceData;
  }

  if (hre.network.name === 'arbitrum') {
    const marketplaceData = await MarketplaceData.attach(Config.marketplaceDataAddress);
    return marketplaceData;
  }

  console.log(`Unknown network ${hre.network.name}`);
  process.exit(1);
}

async function getUserAddress(hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.ethers.getSigners();
  return accounts[0].address;
}

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("mine", "mine blocks locally")
.addParam("blocks", "how many")
.setAction(async ({ blocks }, hre) => {
  await hre.network.provider.send("hardhat_mine", [`0x${parseInt(blocks).toString(16)}`]);
});

task("timetravel", "go into the future")
.addParam("seconds", "how many")
.setAction(async ({ seconds }, hre) => {
  await hre.network.provider.send("evm_increaseTime", [`0x${parseInt(seconds).toString(16)}`]);
  await hre.network.provider.send("evm_mine");
});

task("gen-wallet", "Creates a new wallet", async (taskArgs, hre) => {
  const wallet = hre.ethers.Wallet.createRandom();
  console.log('address', wallet.address);
  console.log('mnemonic', wallet.mnemonic.phrase);
  console.log('privateKey', wallet.privateKey);
});

// task("send-eth", "Send ether")
// .addParam("to", "Receiver address")
// .addParam("amount", "Eth")
// .setAction(async ({ to, amount }, hre) => {
//   const [account] = await hre.ethers.getSigners();
//   console.log(`Sending ${amount} ETH to ${to}`);
//   const receipt = await account.sendTransaction({
//     to,
//     value: hre.ethers.parseEther(amount),
//   });
//   console.log(`Transaction hash: ${receipt.hash}`);
// });

// task("send-token", "Mint test tokens")
// .addParam("to", "address")
// .addParam("amount", "amount")
// .setAction(async ({ to, amount }, hre) => {
//     console.log(`Sending ${amount} TST to ${to}`);
//     const Token = await hre.ethers.getContractFactory("FakeToken");
//     const fakeToken = await Token.attach(Config.fakeTokenAddress) as FakeToken;
//     const tx = await fakeToken.transfer(to, hre.ethers.parseEther(amount));
//     const receipt = await tx.wait();
//     console.log(`Transaction hash: ${receipt.hash}`);
// });


// task("marketplace:transferOwnership", "Transfer admin ownership of Marketplace")
// .addParam("address", "To who?")
// .setAction(async ({ address }, hre) => {
//   const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
//   const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
//   const tx = await marketplace.transferOwnership(address);
//   await tx.wait();
// });

// task("marketplace:transferPauser", "Transfer pause ability of Marketplace")
// .addParam("address", "To who?")
// .setAction(async ({ address }, hre) => {
//   const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
//   const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
//   const tx = await marketplace.transferPauser(address);
//   await tx.wait();
// });

// task("marketplace:isPaused", "Check if marketplace is paused")
// .setAction(async ({ }, hre) => {
//   const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
//   const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
//   const paused = await marketplace.paused();
//   console.log(`Marketplace is paused: ${paused}`);
// });

// task("marketplace:setPaused", "Pause engine")
// .addParam("pause", "Pause/Unpause")
// .setAction(async ({ pause }, hre) => {
//   const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
//   const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
//   const tx = await marketplace.setPaused(pause === 'true');
//   await tx.wait();
//   const paused = await marketplace.paused();
//   console.log(`Marketplace is now ${paused ? 'paused' : 'unpaused'}`);
// });

// task("marketplace:setVersion", "Set engine version for miner check")
// .addParam("n", "Version Number")
// .setAction(async ({ n }, hre) => {
//   const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
//   const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
//   const tx = await marketplace.setVersion(n);
//   await tx.wait();
//   const versionNow = await marketplace.version();
//   console.log(`Marketplace is now version ${versionNow}`);
// });

// task("marketplace:version", "Set engine version for miner check")
// .setAction(async ({ }, hre) => {
//   const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
//   const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
//   const versionNow = await marketplace.version();
//   console.log(`Marketplace is now version ${versionNow}`);
// });

task("marketplace:seed", "Seed local marketplace instance")
.setAction(async ({ }, hre) => {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
  const marketplace = await Marketplace.attach(Config.marketplaceAddress) as unknown as Marketplace;

  const MarketplaceData = await hre.ethers.getContractFactory("MarketplaceDataV1");
  const marketplaceData = await MarketplaceData.attach(Config.marketplaceDataAddress) as unknown as MarketplaceData;

  const FakeToken = await hre.ethers.getContractFactory("FakeToken");
  const fakeToken = FakeToken.attach(Config.fakeTokenAddress) as unknown as FakeToken;

  const [deployer, owner, worker, arbitrator] = await hre.ethers.getSigners();
  await marketplace.connect(deployer).setMarketplaceDataAddress(await marketplaceData.getAddress());

  console.log('Seeding marketplace with test data on chainId', (await deployer.provider.getNetwork()).chainId);

  console.log('Sending fake tokens to users');
  await fakeToken.connect(deployer).transfer(await deployer.getAddress(), BigInt(1000e18));
  await fakeToken.connect(deployer).approve(await marketplace.getAddress(), BigInt(2000e18));

  await fakeToken.connect(deployer).transfer(await owner.getAddress(), BigInt(1000e18));
  await fakeToken.connect(owner).approve(await marketplace.getAddress(), BigInt(2000e18));

  await fakeToken.connect(deployer).transfer(await worker.getAddress(), BigInt(1000e18));
  await fakeToken.connect(worker).approve(await marketplace.getAddress(), BigInt(2000e18));

  await fakeToken.connect(deployer).transfer(await arbitrator.getAddress(), BigInt(1000e18));
  await fakeToken.connect(arbitrator).approve(await marketplace.getAddress(), BigInt(2000e18));

  console.log("Registering users");
  await marketplaceData.connect(owner).registerUser((await getEncryptionSigningKey(owner)).compressedPublicKey, "Owner", "I am the coolest job creator", "https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80");
  await marketplaceData.connect(worker).registerUser((await getEncryptionSigningKey(worker)).compressedPublicKey, "Worker", "Best worker around", "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80");
  await marketplaceData.connect(arbitrator).registerArbitrator((await getEncryptionSigningKey(arbitrator)).compressedPublicKey, "Arbitrator", "I can arbitrate anything", "https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=0&w=256&h=256&q=80", 100);

  console.log('Creating jobs');
  {
    const content = 'I am looking for someone to write a story book about Bitcoin and the blockchain. The book should be at least 20 pages long and include a brief history of Bitcoin, the technology behind it, and the potential impact it could have on the world. I am looking for someone who can write in a way that is easy to understand and engaging for a general audience. It should have illustrations and be suitable for children.';
    const { hash: contentHash } = await publishToIpfs(content);
    const { hash: updatedHash } = await publishToIpfs('[Updated] ' + content);
    await marketplace.connect(owner).publishJobPost(
      'Create a story book about Bitcoin',
      contentHash,
      true,
      ["DT"],
      await fakeToken.getAddress(),
      BigInt(100e18),
      BigInt(60 * 60 * 24 * 3),
      "Digital",
      ZeroAddress,
      [worker.address]
    );

    const jobId = 0;

    await marketplace.connect(owner).updateJobPost(
      0n,
      '[Updated] Create a story book about Bitcoin',
      updatedHash,
      ["DO", "Text"],
      BigInt(200e18),
      BigInt(60 * 60 * 24 * 4),
      arbitrator.address,
      true
    );

    await marketplace.connect(owner).payStartJob(0n, worker.address);
    await marketplace.connect(worker).refund(0n);
    await marketplace.connect(arbitrator).refuseArbitration(0n);

    await marketplace.connect(owner).closeJob(0n);
    await marketplace.connect(owner).reopenJob(0n);

    await marketplace.connect(owner).updateJobWhitelist(0n, [worker.address], []);
    await marketplace.connect(owner).payStartJob(0n, worker.address);

    // worker delivers the result
    const result = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const workerSessionKey = await getSessionKey(worker, await marketplaceData.connect(worker).publicKeys(owner.address), jobid);
    const { hash: resultHash } = await publishToIpfs(result, workerSessionKey);

    await marketplace.connect(worker).deliverResult(0n, resultHash);
    await marketplace.connect(owner).approveResult(0n, 4n, "Nice, but could be better!");
  }

  {
    const content = 'I am looking to compose a song about Bitcoin. The song should be catchy and easy to remember. It should include lyrics that explain what Bitcoin is, how it works, and why it is important. The song should be suitable for all ages and should be fun to listen to. I am looking for someone who can write lyrics and compose music.';
    const { hash: contentHash } = await publishToIpfs(content);
    await marketplace.connect(owner).publishJobPost(
      'Create a music track about Bitcoin',
      contentHash,
      true,
      ["DA"],
      await fakeToken.getAddress(),
      BigInt(100e18),
      BigInt(60 * 60 * 24 * 7),
      "Digital",
      ZeroAddress,
      []
    );

    const jobId = 1;

    // worker reads the post data
    const workerSessionKey = await getSessionKey(worker, await marketplaceData.connect(worker).publicKeys(owner.address), jobId);

    // worker posts a thread message
    const workerMessage = "I can do it!";
    const { hash: workerMessageHash } = await publishToIpfs(workerMessage, workerSessionKey);

    await marketplace.connect(worker).postThreadMessage(jobId, workerMessageHash, owner.address);

    await marketplace.connect(owner).payStartJob(jobId, worker.address);
  }

  {
    const content = 'I am looking for someone to design a landing page for a new token. The landing page should be visually appealing and easy to navigate. It should include information about the token, its use cases, and how to purchase it. I am looking for someone who can create a design that is modern and professional.';
    const { hash: contentHash } = await publishToIpfs(content);
    await marketplace.connect(owner).publishJobPost(
      'Design a landing page for a new token',
      contentHash,
      false,
      ["DA"],
      await fakeToken.getAddress(),
      BigInt(100e18),
      BigInt(60 * 60 * 24 * 5),
      "Digital",
      arbitrator.address,
      []
    );
    const jobId = 2;

    // worker reads the post data
    const workerSessionKey = await getSessionKey(worker, await marketplaceData.connect(worker).publicKeys(owner.address), jobId);

    // worker posts a thread message
    const workerMessage = "I can do it!";
    const { hash: workerMessageHash } = await publishToIpfs(workerMessage, workerSessionKey);

    await marketplace.connect(worker).postThreadMessage(jobId, workerMessageHash, owner.address);

    const ownerSessionKey = await getSessionKey(owner, await marketplaceData.connect(owner).publicKeys(worker.address), jobId);
    const ownerMessage = "Go ahead!";
    const { hash: ownerMessageHash } = await publishToIpfs(ownerMessage, ownerSessionKey);

    await marketplace.connect(owner).postThreadMessage(jobId, ownerMessageHash, worker.address);

    // worker takes the job
    const revision = await marketplaceData.eventsLength(jobId);
    const signature = await worker.signMessage(getBytes(keccak256(AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, jobId]))));

    await marketplace.connect(worker).takeJob(jobId, signature);

    // worker delivers the result
    const result = "I did not really manage to create a marketplace in solidity, but take a look for my partial solution";
    const { hash: resultHash } = await publishToIpfs(result, workerSessionKey);

    await marketplace.connect(worker).deliverResult(jobId, resultHash);

    // owner raises a dispute
    const disputeContent = "I am not satisfied with the result";
    const sessionKeyOW = await getSessionKey(owner, await marketplaceData.connect(owner).publicKeys(worker.address), jobId);
    const sessionKeyOA = await getSessionKey(owner, (await marketplaceData.connect(owner).arbitrators(arbitrator.address)).publicKey, jobId);

    const encryptedContent = hexlify(encryptUtf8Data(disputeContent, sessionKeyOA));
    const encrypedSessionKey = hexlify(encryptBinaryData(getBytes(sessionKeyOW), sessionKeyOA));

    await marketplace.connect(owner).dispute(jobId, encrypedSessionKey, encryptedContent);

    // arbitrator arbitrates
    const creatorShare = 0.8 * 100 * 100;
    const workerShare = 0.2 * 100 * 100;
    const reason = "Worker delivered mediocre results";
    const { hash: reasonHash } = await publishToIpfs(reason, sessionKeyOW);

    await marketplace.connect(arbitrator).arbitrate(jobId, creatorShare, workerShare, reasonHash);

    await owner.provider.send("evm_increaseTime", [60 * 60 * 24]);
    await owner.provider.send("evm_mine", []);

    await marketplace.connect(owner).withdrawCollateral(jobId);
  }

  console.log("Done seeding marketplace on chainId", (await deployer.provider.getNetwork()).chainId);
});


task("chainId", "Seed local marketplace instance")
.setAction(async ({ }, hre) => {
  const [deployer] = await hre.ethers.getSigners();
  console.log((await deployer.provider.getNetwork()).chainId);
});

task("arbitrator:register", "Register as arbitrator")
.addOptionalParam("pubkey", "Specify a different pubkey for encryption")
.addParam("name", "Name (must be 1-20 characters)")
.addOptionalParam("bio", "Bio")
.addOptionalParam("avatar", "Avatar")
.addParam("fee", "Fee in bps (10000 = 100%)")
.setAction(async ({ pubkey, name, bio, avatar, fee }, hre) => {
  const marketplaceData = await getMarketplaceData(hre);

  // try to load from params first otherwise use the default signer
  if (! pubkey) {
    const accounts = await hre.ethers.getSigners();
    const account = accounts[0];
    const signingKey = await getEncryptionSigningKey(account);
    pubkey = signingKey.compressedPublicKey;
  }

  console.log("Registering arbitrator with pubkey", pubkey);

  const tx = await marketplaceData.registerArbitrator(
    pubkey,
    name,
    bio || "",
    avatar || "",
    fee,
  );

  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("arbitrator:update", "Update arbitrator")
.addParam("name", "Name (must be 1-20 characters)")
.addOptionalParam("bio", "Bio")
.addOptionalParam("avatar", "Avatar")
.setAction(async ({ name, bio, avatar }, hre) => {
  const marketplaceData = await getMarketplaceData(hre);

  const tx = await marketplaceData.updateArbitrator(
    name,
    bio || "",
    avatar || "",
  );

  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("arbitrator:refuse", "Refuse arbitration")
.addParam("jobid", "Job ID")
.setAction(async ({ jobid }, hre) => {
  const marketplace = await getMarketplace(hre);

  const tx = await marketplace.refuseArbitration(jobid);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("arbitrator:arbitrate", "Arbitrate a job")
.addParam("jobid", "Job ID")
.addParam("ownerShare", "Buyer share in bips")
.addParam("workerShare", "Worker share in bips")
.addParam("reason", "Reason")
.setAction(async ({ jobId, ownerShare, workerShare, reason }, hre) => {
  const marketplace = await getMarketplace(hre);
  const marketplaceData = await getMarketplaceData(hre);

  // TODO encrypt reason
  throw new Error("Not implemented");



  const reasonHash = (await publishToIpfs(reason)).hash;
  const tx = await marketplace.arbitrate(BigInt(jobId), ownerShare, workerShare, reasonHash);
  const receipt = await tx.wait();
  console.log("Transaction hash:", receipt.hash);
});

task("arbitrator:decode", "Decode encrypted data")
.addParam("jobid", "Job ID")
.addOptionalParam("index", "Index of the message (if not set retrieve all)")
.setAction(async ({ jobid }, hre) => {
  const marketplaceData = await getMarketplaceData(hre);

  const events = await marketplaceData.getEvents(jobid, 0, 0);
  for (let data of events) {
    const eventType      = Number(data[0]);
    const eventAddress   = data[1];
    const eventData      = data[2];
    const eventTimestamp = data[3];

    const bytes = getBytes(eventData);
    const decoded = decodeCustomJobEvent(eventType, bytes) as any;

    const json = JSON.stringify(decoded, (key, value) =>
      typeof value === 'bigint' ? value.toString() + 'n' : value);

    console.log(`[${jobEventTypeToString(eventType)}] ${eventTimestamp} ${eventAddress}`);
    console.log(json);

    switch (eventType) {
      case JobEventType.Created: {
        const cid = hashToCid(decoded.contentHash);
        const content = await getFromIpfs(cid);
        console.log(content);
        break;
      }
      case JobEventType.Updated: {
        const cid = hashToCid(decoded.contentHash);
        const content = await getFromIpfs(cid);
        console.log(content);
        break;
      }
      case JobEventType.WorkerMessage: {
        const cid = hashToCid(decoded.contentHash);
        const content = await getFromIpfs(cid);
        console.log(content);
        break;
      }
      case JobEventType.OwnerMessage: {
        const cid = hashToCid(decoded.contentHash);
        const content = await getFromIpfs(cid);
        console.log(content);
        break;
      }
      default:
        break;
    }

    console.log("");
  }
});

task("user:register", "Register as user")
.addOptionalParam("pubkey", "Specify a different pubkey for encryption")
.addParam("name", "Name (must be 1-20 characters)")
.addOptionalParam("bio", "Bio")
.addOptionalParam("avatar", "Avatar")
.setAction(async ({ pubkey, name, bio, avatar }, hre) => {
  const marketplaceData = await getMarketplaceData(hre);

  if (! pubkey) {
    const accounts = await hre.ethers.getSigners();
    const account = accounts[0];
    pubkey = (await getEncryptionSigningKey(account)).compressedPublicKey;
  }

  console.log("Registering user with pubkey", pubkey);

  const tx = await marketplaceData.registerUser(
    pubkey,
    name,
    bio || "",
    avatar || "",
  );

  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("user:update", "Update user")
.addParam("name", "Name (must be 1-20 characters)")
.addOptionalParam("bio", "Bio")
.addOptionalParam("avatar", "Avatar")
.setAction(async ({ name, bio, avatar }, hre) => {
  const marketplaceData = await getMarketplaceData(hre);

  const tx = await marketplaceData.updateUser(
    name,
    bio || "",
    avatar || "",
  );

  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("job:publish", "Publish a job post")
.addParam("title", "Title of job")
.addParam("content", "Content / job description")
.addOptionalParam("lucky", "I'm feeling lucky (allow worker to decide to start immediately)", "false")
.addOptionalParam("tags", "Tags (separated by comma)", "")
.addOptionalParam("token", "Token address (default USDC)", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831")
.addParam("amount", "Amount of tokens")
.addParam("deadline", "Max time in seconds", "3600")
.addOptionalParam("delivery", "Delivery method", "ipfs")
.addOptionalParam("arbitrator", "Arbitrator address", ZeroAddress)
.addOptionalParam("whitelist", "Whitelist addresses (separated by comma)", "")
.setAction(async ({
  title,
  content,
  lucky,
  tags,
  token,
  amount,
  deadline,
  delivery,
  arbitrator,
  whitelist
}, hre) => {
  const marketplace = await getMarketplace(hre);
  const marketplaceData = await getMarketplaceData(hre);

  console.log("Publishing job post with address", await getUserAddress(hre));

  const tokenContract = await hre.ethers.getContractAt("FakeToken", token);
  const decimals = await tokenContract.decimals();
  const amountInWei = hre.ethers.parseUnits(amount, decimals);

  const allowance = await tokenContract.allowance(
    await getUserAddress(hre),
    await marketplace.getAddress()
  );

  if (allowance < amountInWei) {
    console.log("Insufficient allowance, approving max tokens (y/n)");
    const ok = await yesno({
      question: "Are you sure?",
    });
    if (! ok) {
      console.log("Aborted");
      process.exit(1);
    }
    const tx = await tokenContract.approve(await marketplace.getAddress(), hre.ethers.MaxUint256);
    const receipt = await tx.wait();
    console.log("Transaction hash:", receipt.hash);
  }

  const contentHash = (await publishToIpfs(content)).hash;
  console.log("Content hash:", contentHash);

  // if lucky is true, multiple applicants is false
  const multipleApplicants = lucky === 'true' ? false : true;

  const tagsArray = tags === '' ? ['DO'] : tags.split(',');
  const whitelistArray = whitelist === '' ? [] : whitelist.split(',');

  const tx = await marketplace.publishJobPost(
    title,
    contentHash,
    multipleApplicants,
    tagsArray,
    token,
    amountInWei,
    BigInt(deadline),
    delivery,
    arbitrator,
    whitelistArray,
  );

  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);

  for (let log of receipt.logs) {
    const parsed1 = marketplace.interface.parseLog(log);
    const parsed2 = marketplaceData.interface.parseLog(log);

    const parsed = parsed1 || parsed2;
    if (! parsed) continue;

    if (parsed.name === 'JobEvent') {
      const jobId = parsed.args.jobId.toString();
      console.log("Job ID:", jobId);
    }
  }
});

task("job:update", "Update a job post")
.addParam("jobid", "Job ID")
.addParam("title", "Title")
.addParam("content", "Content")
.addOptionalParam("tags", "Tags")
.addParam("amount", "Amount of tokens")
.addParam("maxTime", "Max time in seconds")
.addOptionalParam("arbitrator", "Arbitrator address")
.addOptionalParam("whitelist", "Whitelist workers")
.setAction(async ({
  jobId,
  title,
  content,
  tags,
  amount,
  maxTime,
  arbitrator,
  whitelist
}, hre) => {
  const marketplace = await getMarketplace(hre);
  const owner = await getUserAddress(hre);
  
  const contentHash = (await publishToIpfs(content)).hash;

  if (! tags) tags = '';
  if (! arbitrator) arbitrator = ZeroAddress;
  if (! whitelist)  whitelist = false;
  
  const tx = await marketplace.updateJobPost(
    BigInt(jobId),
    title,
    contentHash,
    tags.split(','),
    BigInt(amount),
    BigInt(maxTime),
    arbitrator,
    true,
  );
  
  const receipt = await tx.wait();
  
  console.log("Transaction hash:", receipt.hash);
});

task("job:whitelist", "Update a job post whitelist")
.addParam("jobid", "Job ID")
.addParam("whitelist", "Workers to add")
.addParam("blacklist", "Workers to remove")
.setAction(async ({ jobid, whitelist, blacklist }, hre) => {
  const marketplace = await getMarketplace(hre);
  const owner = await getUserAddress(hre);

  const tx = await marketplace.updateJobWhitelist(
    BigInt(jobid),
    whitelist.split(','),
    blacklist.split(','),
  );

  const receipt = await tx.wait();
  
  console.log("Transaction hash:", receipt.hash);
});

task("job:start", "Start job / pick applicant")
.addParam("jobid", "Job ID")
.addParam("worker", "Worker address")
.setAction(async ({ jobid, worker }, hre) => {
  const marketplace = await getMarketplace(hre);

  const tx = await marketplace.payStartJob(jobid, worker);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("job:message", "Post a message in a job thread")
.addParam("jobid", "Job ID")
.addParam("message", "Message")
.setAction(async ({ jobid, message }, hre) => {
  const marketplace = await getMarketplace(hre);
  const marketplaceData = await getMarketplaceData(hre);

  const job = await marketplace.jobs(jobid);
  const owner = job.jobRoles.owner;
  const accounts = await hre.ethers.getSigners();
  const worker = accounts[0];
  const workerSessionKey = await getSessionKey(worker, await marketplaceData.publicKeys(owner.address), jobid);

  const { hash } = await publishToIpfs(message, workerSessionKey);

  const tx = await marketplace.postThreadMessage(jobid, hash, owner.address);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});



task("job:close", "Close a job post")
.addParam("jobid", "Job ID")
.setAction(async ({ jobid }, hre) => {
  const marketplace = await getMarketplace(hre);
  const owner = await getUserAddress(hre);

  const tx = await marketplace.closeJob(BigInt(jobid));

  const receipt = await tx.wait();
  
  console.log("Transaction hash:", receipt.hash);
});

task("job:withdraw", "Withdraw job collateral")
.addParam("jobid", "Job ID")
.setAction(async ({ jobid }, hre) => {
  const marketplace = await getMarketplace(hre);
  const owner = await getUserAddress(hre);

  const tx = await marketplace.withdrawCollateral(BigInt(jobid));

  const receipt = await tx.wait();
  
  console.log("Transaction hash:", receipt.hash);
});

task("job:reopen", "Reopen a job post")
.addParam("jobid", "Job ID")
.setAction(async ({ jobid }, hre) => {
  const marketplace = await getMarketplace(hre);
  const owner = await getUserAddress(hre);

  const tx = await marketplace.reopenJob(BigInt(jobid));

  const receipt = await tx.wait();
  
  console.log("Transaction hash:", receipt.hash);
});

task("job:dispute", "Raise a dispute on a job")
.addParam("jobid", "Job ID")
.addParam("message", "Dispute content")
.setAction(async ({ jobid, message }, hre) => {
  const marketplace = await getMarketplace(hre);
  const marketplaceData = await getMarketplaceData(hre);

  const accounts = await hre.ethers.getSigners();
  const owner = accounts[0];

  const job = await marketplace.jobs(jobid);
  const worker = job.jobRoles.worker;
  const arbitrator = job.arbitrator;

  const sessionKeyOW = await getSessionKey(owner, await marketplaceData.publicKeys(worker.address), jobid);
  const sessionKeyOA = await getSessionKey(owner, (await marketplaceData.arbitrators(arbitrator.address)).publicKey, jobid);

  const encryptedContent = hexlify(encryptUtf8Data(message, sessionKeyOA));
  const encrypedSessionKey = hexlify(encryptBinaryData(getBytes(sessionKeyOW), sessionKeyOA));

  const tx = await marketplace.dispute(jobid, encrypedSessionKey, encryptedContent);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("job:deliver", "Provide job result / deliverable")
.addParam("jobid", "Job ID")
.addParam("result", "Result (uploaded to ipfs)")
.setAction(async ({ jobid, result }, hre) => {
  const marketplace = await getMarketplace(hre);

  const { hash } = await publishToIpfs(result);
  const tx = await marketplace.deliverResult(jobid, hash);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("job:approve", "Approve a job result")
.addParam("jobid", "Job ID")
.addParam("rating", "Rating 1-5 score of the worker. Set to 0 for no review")
.addParam("review", "Review text")
.setAction(async ({ jobid, rating, review }, hre) => {
  const marketplace = await getMarketplace(hre);

  const tx = await marketplace.approveResult(jobid, rating, review);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("job:review", "Review job creator")
.addParam("jobid", "Job ID")
.addParam("rating", "Rating 1-5 score of the creator. Set to 0 for no review")
.addParam("review", "Review text")
.setAction(async ({ jobid, rating, review }, hre) => {
  const marketplace = await getMarketplace(hre);

  const tx = await marketplace.review(jobid, rating, review);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});

task("job:refund", "Refund job")
.addParam("jobid", "Job ID")
.setAction(async ({ jobid }, hre) => {
  const marketplace = await getMarketplace(hre);

  const tx = await marketplace.refund(jobid);
  const receipt = await tx.wait();

  console.log("Transaction hash:", receipt.hash);
});
