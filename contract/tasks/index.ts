import * as fs from 'fs';
import ProxyAdminArtifact from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json';
import { MarketplaceV1 as Marketplace } from '../typechain-types/contracts/MarketplaceV1';
import { FakeToken } from '../typechain-types/contracts/unicrow/FakeToken';
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { task } from "hardhat/config";
import Config from '../scripts/config.json';


async function getMinerAddress(hre: HardhatRuntimeEnvironment) {
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

task("send-eth", "Send ether")
.addParam("to", "Receiver address")
.addParam("amount", "Eth")
.setAction(async ({ to, amount }, hre) => {
  const [account] = await hre.ethers.getSigners();
  console.log(`Sending ${amount} ETH to ${to}`);
  const receipt = await account.sendTransaction({
    to,
    value: hre.ethers.parseEther(amount),
  });
  console.log(`Transaction hash: ${receipt.hash}`);
});

task("send-token", "Mint test tokens")
.addParam("to", "address")
.addParam("amount", "amount")
.setAction(async ({ to, amount }, hre) => {
    console.log(`Sending ${amount} TST to ${to}`);
    const Token = await hre.ethers.getContractFactory("FakeToken");
    const fakeToken = await Token.attach(Config.fakeTokenAddress) as FakeToken;
    const tx = await fakeToken.transfer(to, hre.ethers.parseEther(amount));
    const receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.hash}`);
});


task("marketplace:transferOwnership", "Transfer admin ownership of Marketplace")
.addParam("address", "To who?")
.setAction(async ({ address }, hre) => {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
  const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
  const tx = await marketplace.transferOwnership(address);
  await tx.wait();
});

task("marketplace:transferPauser", "Transfer pause ability of Marketplace")
.addParam("address", "To who?")
.setAction(async ({ address }, hre) => {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
  const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
  const tx = await marketplace.transferPauser(address);
  await tx.wait();
});

task("marketplace:isPaused", "Check if marketplace is paused")
.setAction(async ({ }, hre) => {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
  const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
  const paused = await marketplace.paused();
  console.log(`Marketplace is paused: ${paused}`);
});

task("marketplace:setPaused", "Pause engine")
.addParam("pause", "Pause/Unpause")
.setAction(async ({ pause }, hre) => {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
  const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
  const tx = await marketplace.setPaused(pause === 'true');
  await tx.wait();
  const paused = await marketplace.paused();
  console.log(`Marketplace is now ${paused ? 'paused' : 'unpaused'}`);
});

task("marketplace:setVersion", "Set engine version for miner check")
.addParam("n", "Version Number")
.setAction(async ({ n }, hre) => {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
  const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
  const tx = await marketplace.setVersion(n);
  await tx.wait();
  const versionNow = await marketplace.version();
  console.log(`Marketplace is now version ${versionNow}`);
});

task("marketplace:version", "Set engine version for miner check")
.setAction(async ({ }, hre) => {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceV1");
  const marketplace = await Marketplace.attach(Config.marketplaceAddress) as Marketplace;
  const versionNow = await marketplace.version();
  console.log(`Marketplace is now version ${versionNow}`);
});
