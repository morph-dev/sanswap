import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { Bank, SanSwapFactory } from '../typechain-types';
import { giveEther, deployCore } from './setup';

const addresses = [
  '0x18e24B27B6152595B9545C1757280EDc46545545',
  '0x4557971a9331Df1BdF0Cd94cfA7BB05f02A27905',
];

async function getTokens(bank: Bank) {
  const tokenSize = (await bank.tokenSize()).toNumber();

  const tokenAddresses: string[] = [];
  for (let i = 0; i < tokenSize; i++) {
    tokenAddresses.push(await bank.tokens(BigNumber.from(i)));
  }

  const MintableToken = await ethers.getContractFactory('MintableToken');
  return new Map(
    await Promise.all(
      tokenAddresses.map(
        async (address) => [await MintableToken.attach(address).symbol(), address] as const
      )
    )
  );
}

async function getPools(factory: SanSwapFactory) {
  const poolCount = (await factory.getPoolCount()).toNumber();

  const poolAddresses: string[] = [];
  for (let i = 0; i < poolCount; i++) {
    poolAddresses.push(await factory.allPools(BigNumber.from(i)));
  }

  const SanSwapPool = await ethers.getContractFactory('SanSwapPool');
  return new Map(
    await Promise.all(
      poolAddresses.map(
        async (address) => [await SanSwapPool.attach(address).symbol(), address] as const
      )
    )
  );
}

async function main() {
  console.log('Transfering Ether...');
  await giveEther(addresses);

  // Core

  console.log('Deploying Contracts...');
  const { bank, factory, router } = await deployCore();

  // Tokens

  console.log('Creating Tokens...');
  await bank.createToken('Mintable Ether', 'mETH', parseEther('1000000')).then((tx) => tx.wait());
  await bank.createToken('Mintable BitCoin', 'mBTC', parseEther('100000')).then((tx) => tx.wait());
  await bank
    .createToken('Mintable USD', 'mUSD', parseEther('1000000000000'))
    .then((tx) => tx.wait());
  await bank
    .createToken('Mintable SanSwap', 'mSS', parseEther('1000000000000'))
    .then((tx) => tx.wait());

  const tokens = await getTokens(bank);
  console.table(Array.from(tokens).map(([symbol, address]) => ({ symbol, address })));

  // Approve router

  for (const tokenAddress of tokens.values()) {
    const MintableToken = await ethers.getContractFactory('MintableToken');
    const token = MintableToken.attach(tokenAddress);
    await token.approve(router.address, ethers.constants.MaxUint256).then((tx) => tx.wait());
  }

  // Pools

  console.log('Creating pools...');
  router
    .addLiquidity(
      addresses[0],
      tokens.get('mUSD') || '',
      tokens.get('mETH') || '',
      tokens.get('mBTC') || '',
      parseEther('1000000000'),
      parseEther('596090'),
      parseEther('43060')
    )
    .then((tx) => tx.wait());

  await router
    .addLiquidity(
      addresses[0],
      tokens.get('mUSD') || '',
      tokens.get('mETH') || '',
      tokens.get('mSS') || '',
      parseEther('100000000'),
      parseEther('59609'),
      parseEther('31173117')
    )
    .then((tx) => tx.wait());

  const pools = await getPools(factory);
  console.log('Pools:');
  console.table(Array.from(pools.entries()).map(([symbol, address]) => ({ symbol, address })));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
