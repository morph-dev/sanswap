import { BaseContract } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { printWalletsBalances } from './utils';

export async function deployContract<T extends BaseContract>(promise: Promise<T>, name: string): Promise<T> {
  const contract = await promise;
  await contract.deployed();
  console.log(`${name} deployed to: ${contract.address}`)
  return contract;
}

export async function main() {
  const [owner, other] = await ethers.getSigners();

  const MintableToken = await ethers.getContractFactory('MintableToken');
  const mETH = await deployContract(MintableToken.deploy('Mintable Ether', 'mETH'), 'mETH');
  const mBTC = await deployContract(MintableToken.deploy('Mintable BitCoin', 'mBTC'), 'mBTC');
  const mUSD = await deployContract(MintableToken.deploy('Mintable USD', 'mUSD'), 'mUSD');
  const mSS = await deployContract(MintableToken.deploy('Mintable SanSwap', 'mSS'), 'mSS');

  const Factory = await ethers.getContractFactory('SanSwapFactory');
  const factory = await deployContract(Factory.deploy(), 'Factory');

  const Router = await ethers.getContractFactory('SanSwapRouter');
  const router = await deployContract(Router.deploy(factory.address), 'Router');

  await mUSD.mint(owner.address, parseEther('2000000000')).then(tx => tx.wait());
  console.log('mUSB minted');

  for (const token of [mETH, mBTC, mUSD, mSS]) {
    await token.approve(router.address, ethers.constants.MaxUint256).then(tx => tx.wait());
    await token.connect(other).approve(router.address, ethers.constants.MaxUint256).then(tx => tx.wait());
  }
  console.log(`Router approved for:\n\t${owner.address}\n\t${other.address}`);

  await router.addLiquidity(
    owner.address,
    mUSD.address,
    mETH.address,
    mBTC.address,
    parseEther('1000000000'),
    parseEther('596090'),
    parseEther('43060'),
  ).then(tx => tx.wait());

  await router.addLiquidity(
    owner.address,
    mUSD.address,
    mETH.address,
    mSS.address,
    parseEther('100000000'),
    parseEther('59609'),
    parseEther('31173117'),
  ).then(tx => tx.wait());

  const pool1 = await ethers.getContractAt(
    'SanSwapPool',
    await factory.pool(mUSD.address, mETH.address, mBTC.address)
  );
  console.log(`${await pool1.name()} (${await pool1.symbol()}) deployed to ${pool1.address}`);

  const pool2 = await ethers.getContractAt(
    'SanSwapPool',
    await factory.pool(mUSD.address, mETH.address, mSS.address)
  );
  console.log(`${await pool2.name()} (${await pool2.symbol()}) deployed to ${pool2.address}`);

  await printWalletsBalances([owner.address, other.address, pool1.address, pool2.address], [mUSD, mETH, mBTC, mSS]);
  await printWalletsBalances([owner.address, other.address, pool1.address, pool2.address], [pool1, pool2]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
