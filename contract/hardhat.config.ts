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
  // limit is 24.576 KiB
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['contracts/MarketplaceV1.sol', 'contracts/MarketplaceDataViewV1.sol'],
  },
  contractsToExtractAbi: ['MarketplaceV1', 'MarketplaceDataViewV1', 'FakeToken', 'Unicrow', 'UnicrowDispute', 'UnicrowArbitrator', 'UnicrowClaim'],
  paths: {
    abi: "wagmi",
  },
};

export default config;
