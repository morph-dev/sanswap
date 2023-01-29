import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { printWalletsBalances } from './utils';

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();

  const MintableToken = await ethers.getContractFactory('MintableToken');
  const tokenA = await MintableToken.deploy('TokenA', 'TA');
  const tokenB = await MintableToken.deploy('TokenB', 'TB');
  const tokenC = await MintableToken.deploy('TokenC', 'TC');

  console.log('TokenA deployed to:', tokenA.address);
  console.log('TokenB deployed to:', tokenB.address);
  console.log('TokenC deployed to:', tokenC.address);

  await printWalletsBalances([owner.address, otherAccount.address], [tokenA, tokenB, tokenC]);

  await tokenA.transfer(otherAccount.address, parseEther('1000'));
  await tokenB.transfer(otherAccount.address, parseEther('10000'));
  await tokenC.connect(otherAccount).mint(otherAccount.address, parseEther('100000'));

  await printWalletsBalances([owner.address, otherAccount.address], [tokenA, tokenB, tokenC]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
