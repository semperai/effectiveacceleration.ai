import "dotenv/config";
import { configWithPkey } from "./hardhat.config.base";

let PRIVATE_KEY = process.env.ARBITRATOR_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  PRIVATE_KEY = "0x" + "0".repeat(64);
}

export default configWithPkey(PRIVATE_KEY);
