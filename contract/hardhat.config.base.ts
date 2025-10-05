import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import "hardhat-ts-plugin-abi-extractor";
import "solidity-docgen";
import "./tasks/index";

// Import MNEMONIC from .env file
let MNEMONIC = process.env.MNEMONIC;

if (!MNEMONIC) {
  MNEMONIC = "rebuild always symbol rabbit sunset napkin laundry diary doll chalk valid train";
}

export function configWithPkey(privateKey: string): HardhatUserConfig {
  return {
    mocha: {
      reporter: process.env.CI ? 'mocha-junit-reporter' : 'spec',
      reporterOptions: {
        mochaFile: 'test-results/junit.xml'
      }
    },
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
      arbitrumSepolia: {
        accounts: {
          mnemonic: MNEMONIC,
        },
        url: "https://sepolia-rollup.arbitrum.io/rpc",
        chainId: 421614
      },
      arbitrum: {
        accounts: [privateKey],
        url: "https://arb1.arbitrum.io/rpc",
        chainId: 42161,
      },
      mainnet: {
        accounts: [privateKey],
        url: "https://eth.llamarpc.com",
        chainId: 1,
      },
    },
    // limit is 24.576 KiB
    contractSizer: {
      alphaSort: true,
      disambiguatePaths: false,
      runOnCompile: true,
      strict: true,
      only: ['contracts/MarketplaceV1.sol', 'contracts/MarketplaceDataV1.sol', 'contracts/EACCToken.sol', 'contracts/EACCBar.sol'],
    },
    contractsToExtractAbi: ['MarketplaceV1', 'MarketplaceDataV1', 'FakeToken', 'Unicrow', 'UnicrowDispute', 'UnicrowArbitrator', 'UnicrowClaim', 'EACCBar', 'EACCToken'],
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
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
}
