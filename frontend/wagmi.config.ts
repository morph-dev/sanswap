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
          [chains.hardhat.id]: '0x2C37171FdA079C7E79DefEf3B0A2E0C5BF182b4A',
        },
        SanSwapFactory: {
          [chains.hardhat.id]: '0xD7ca2476Ae959e6bcA56Db9e472bD435B4E10Fad',
        },
        SanSwapRouter: {
          [chains.hardhat.id]: '0x69Bf3b46c6a1cB85f9406B32CbFDab5C4C671D44',
        },
      },
    }),
  ],
});
