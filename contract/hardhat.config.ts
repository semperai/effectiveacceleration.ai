import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import "hardhat-ts-plugin-abi-extractor";
import "./tasks/index";

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
    arbitrumSepolia: {
      accounts: {
        mnemonic: "park ice isolate false ribbon business acid onion sunny supply cake tattoo",

      },
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614
    }
  },
  // limit is 24.576 KiB
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['contracts/MarketplaceV1.sol', 'contracts/MarketplaceDataV1.sol'],
  },
  contractsToExtractAbi: ['MarketplaceV1', 'MarketplaceDataV1', 'FakeToken', 'Unicrow', 'UnicrowDispute', 'UnicrowArbitrator', 'UnicrowClaim'],
  paths: {
    abi: "wagmi",
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: 'NQDDEPSUNVM2JQP93GVGG4TFPIPKKEZKAN'
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/"
        }
      },
    ]
  }
};

export default config;
