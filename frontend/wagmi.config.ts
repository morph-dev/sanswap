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
          [chains.hardhat.id]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        },
        SanSwapFactory: {
          [chains.hardhat.id]: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        },
        SanSwapRouter: {
          [chains.hardhat.id]: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        },
      },
    }),
  ],
});
