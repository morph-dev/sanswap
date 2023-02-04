import { ethers } from 'hardhat';

async function main() {
  const Bank = await ethers.getContractFactory('Bank');
  const bank = await Bank.deploy();
  console.log('Bank deployed to:', bank.address);

  const Factory = await ethers.getContractFactory('SanSwapFactory');
  const factory = await Factory.deploy();
  console.log('Factory deployed to:', factory.address);

  const Router = await ethers.getContractFactory('SanSwapRouter');
  const router = await Router.deploy(factory.address);
  console.log('Router deployed to:', router.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
