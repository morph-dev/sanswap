import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

export async function giveEther(addresses: string[]) {
  const [owner] = await ethers.getSigners();

  for (const address of addresses) {
    if (owner.address !== address) {
      await owner.sendTransaction({
        to: address,
        value: ethers.utils.parseEther('1'),
      });
    }
  }
}

export async function deployCore() {
  const Bank = await ethers.getContractFactory('Bank');
  const bank = await Bank.deploy();
  console.log('Bank deployed to:', bank.address);

  const Factory = await ethers.getContractFactory('SanSwapFactory');
  const factory = await Factory.deploy();
  console.log('Factory deployed to:', factory.address);

  const Router = await ethers.getContractFactory('SanSwapRouter');
  const router = await Router.deploy(factory.address);
  console.log('Router deployed to:', router.address);

  return { bank, factory, router };
}

export async function deployAndAddLiquidity() {
  const [owner] = await ethers.getSigners();

  const MintableToken = await ethers.getContractFactory('MintableToken');

  const tokenA = await MintableToken.deploy('TokenA', 'TA');
  console.log('TokenA deployed to:', tokenA.address);
  const tokenB = await MintableToken.deploy('TokenB', 'TB');
  console.log('TokenB deployed to:', tokenB.address);
  const tokenC = await MintableToken.deploy('TokenC', 'TC');
  console.log('TokenC deployed to:', tokenC.address);

  const Factory = await ethers.getContractFactory('SanSwapFactory');
  const factory = await Factory.deploy();
  console.log('Factory deployed to:', factory.address);

  const Router = await ethers.getContractFactory('SanSwapRouter');
  const router = await Router.deploy(factory.address);
  console.log('Router deployed to:', router.address);

  for (const token of [tokenA, tokenB, tokenC]) {
    await token.approve(router.address, ethers.constants.MaxUint256);
  }

  await router.addLiquidity(
    owner.address,
    tokenA.address,
    tokenB.address,
    tokenC.address,
    parseEther('1000000'),
    parseEther('1000000'),
    parseEther('1000000')
  );

  const pool = await ethers.getContractAt(
    'SanSwapPool',
    await factory.pool(tokenA.address, tokenB.address, tokenC.address)
  );

  return { owner, tokenA, tokenB, tokenC, factory, pool, router };
}
