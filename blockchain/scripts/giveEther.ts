import { giveEther } from './setup';

function main() {
  const addresses = [
    '0x18e24B27B6152595B9545C1757280EDc46545545',
    '0x4557971a9331Df1BdF0Cd94cfA7BB05f02A27905',
  ];
  return giveEther(addresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
