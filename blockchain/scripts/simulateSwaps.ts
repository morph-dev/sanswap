import { BigNumber } from 'ethers';
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils';
import { MintableToken } from '../typechain-types';
import { deployAndAddLiquidity } from './setup';
import { printWalletBalances, printWalletsBalances } from './utils';

const ITERATIONS = 10;
const MAX_AMOUNT = 100000;

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function printK(balances: BigNumber[]) {
  let k = BigNumber.from(1);
  balances.forEach((balance) => (k = k.mul(balance)));
  // balances.forEach((balance) => console.log(formatUnits(balance, 18)));
  console.log(`K = ${formatUnits(k, 3 * 18)}`);
  return k;
}

function balances(address: string, tokens: MintableToken[]): Promise<BigNumber[]> {
  return Promise.all(tokens.map((token) => token.balanceOf(address)));
}

enum SwapType {
  ONE_FOR_ONE = 0,
  ONE_FOR_TWO = 1,
  TWO_FOR_ONE = 2,
}

async function main() {
  const { owner, tokenA, tokenB, tokenC, pool, router } = await deployAndAddLiquidity();

  const tokens = [tokenA, tokenB, tokenC];

  for (let i = 0; i < ITERATIONS; i++) {
    shuffle(tokens);
    // printK(await pool.reserves());
    const swapType = Math.floor(Math.random() * 3);
    const balanceBefore = await balances(owner.address, tokens);
    switch (swapType) {
      case SwapType.ONE_FOR_ONE: {
        const amountIn = parseEther(String(Math.random() * MAX_AMOUNT));
        router.swapOneForOne(
          owner.address,
          tokens[0].address,
          tokens[1].address,
          tokens[2].address,
          amountIn
        );
        break;
      }
      case SwapType.ONE_FOR_TWO: {
        const amountIn = parseEther(String(Math.random() * MAX_AMOUNT));
        router.swapOneForTwo(
          owner.address,
          tokens[0].address,
          tokens[1].address,
          tokens[2].address,
          amountIn
        );
        break;
      }
      case SwapType.TWO_FOR_ONE: {
        const amountIn1 = parseEther(String(Math.random() * MAX_AMOUNT));
        const amountIn2 = parseEther(String(Math.random() * MAX_AMOUNT));
        router.swapTwoForOne(
          owner.address,
          tokens[0].address,
          tokens[1].address,
          tokens[2].address,
          amountIn1,
          amountIn2
        );
        break;
      }
    }
    const balanceAfter = await balances(owner.address, tokens);
    const balanceDiff = balanceAfter.map((after, i) => after.sub(balanceBefore[i]));
    console.log('Swapped:');
    const inPool = await Promise.all(
      balanceDiff
        .map((d, i) => [d, i] as const)
        .filter(([d]) => d.isNegative())
        .map(async ([d, i]) => `    ${formatEther(d.abs())} ${await tokens[i].symbol()}`)
    );
    console.log(inPool.join('\n'));
    console.log('  =>');
    const outPool = await Promise.all(
      balanceDiff
        .map((d, i) => [d, i] as const)
        .filter(([d]) => !d.isNegative() && !d.isZero())
        .map(async ([d, i]) => `    ${formatEther(d)} ${await tokens[i].symbol()}`)
    );
    console.log(outPool.join('\n'));

    // printK(await pool.reserves());
    await printWalletBalances(pool.address, [tokenA, tokenB, tokenC]);
  }
  printK(await pool.reserves());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
