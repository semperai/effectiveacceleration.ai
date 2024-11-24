import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import "hardhat-ts-plugin-abi-extractor";
import "solidity-docgen";
import "./tasks/index";

let PRIVATE_KEY = process.env.WORKER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  PRIVATE_KEY = "0x" + "0".repeat(64);
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    abi: "wagmi",
  },
  networks: {
    hardhat: {
      // support running local node with custom chain id
      chainId: process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 31337,
      accounts: {
        mnemonic: "rebuild always symbol rabbit sunset napkin laundry diary doll chalk valid train",
        initialIndex: 0,
        count: 20,
        path: "m/44'/60'/0'/0",
        accountsBalance: "1"+"0".repeat(24),
        passphrase: undefined,
      }
    },
    localhost: {
      // support running local node with custom chain id
      accounts: {
        mnemonic: "rebuild always symbol rabbit sunset napkin laundry diary doll chalk valid train",
        initialIndex: 0,
        count: 20,
        path: "m/44'/60'/0'/0",
        accountsBalance: "1"+"0".repeat(24),
        passphrase: undefined,
      }
    },
    arbitrum: {
      accounts: [PRIVATE_KEY],
      url: "https://arbitrum.llamarpc.com",
      chainId: 42161,
    },
  },
};

export default config;
