import IConfig_ from "../../scripts/config.json";

import ConfigArbOne from "../../scripts/config.arb-one.json";
import ConfigArbSepolia from "../../scripts/config.arb-sepolia.json";
import ConfigLocal from "../../scripts/config.local.json";

export type IConfig = typeof IConfig_;

// names are strictly the same as in the wagmi config
const networkConfigs: Record<string, IConfig> = {
  "Arbitrum One": ConfigArbOne,
  "Arbitrum Sepolia": ConfigArbSepolia,
  "Hardhat": ConfigLocal,
};

export const Config = (networkName: string): IConfig => {
  if (!networkConfigs[networkName]) {
    throw new Error(`Config not found for network: ${networkName}`);
  }
  return networkConfigs[networkName];
}
