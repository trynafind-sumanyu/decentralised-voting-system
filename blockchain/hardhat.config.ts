import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",

  networks: {
    localhost: {
      url: process.env.RPC_URL_LOCAL || "http://127.0.0.1:8545",
    },

    amoy: {
      url: process.env.RPC_URL_AMOY || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;