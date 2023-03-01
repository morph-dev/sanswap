import chains from '@wagmi/chains';
import { defineConfig } from '@wagmi/cli';
import { hardhat, react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'src/generated/blockchain.ts',
  contracts: [],
  plugins: [
    react(),
    hardhat({
      project: '../blockchain',
      commands: {
        clean: 'yarn hardhat clean',
        build: 'yarn hardhat compile',
        rebuild: 'yarn hardhat compile',
      },
      deployments: {
        Bank: {
          [chains.hardhat.id]: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        },
        SanSwapFactory: {
          [chains.hardhat.id]: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
          [chains.goerli.id]: '0xCD4bd72f26fB5808E9c7548940471fDC51eE426D',
        },
        SanSwapRouter: {
          [chains.hardhat.id]: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
          [chains.goerli.id]: '0x458Ff49Fc3e8FCcc3E69d7Bd53f769D57B131571',
        },
      },
    }),
  ],
});
