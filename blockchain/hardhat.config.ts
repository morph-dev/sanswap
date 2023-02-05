import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  defaultNetwork: 'localhost',
  networks: {
    goerli: {
      url: process.env.ALCHEMY_GOERLI_URL,
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC,
        count: 10,
      },
    },
  },
};

export default config;
