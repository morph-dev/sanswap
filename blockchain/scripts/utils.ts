import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { MintableToken } from '../typechain-types';

async function getWalletBalance(wallet: string, token: MintableToken): Promise<number> {
  const decimals = await token.decimals();
  return parseFloat(formatUnits(await token.balanceOf(wallet), decimals));
}

async function getWalletBalances(
  wallet: string,
  tokens: (readonly [string, MintableToken])[]
): Promise<Record<string, number>> {
  const balances = await Promise.all(
    tokens.map(async ([name, token]) => [name, await getWalletBalance(wallet, token)] as const)
  );
  return Object.fromEntries(balances);
}

export async function printWalletBalances(wallet: string, tokens: MintableToken[]) {
  const tokensWithNames = await Promise.all(
    tokens.map(async (token) => [await token.name(), token] as const)
  );
  console.table(await getWalletBalances(wallet, tokensWithNames));
}

export async function printWalletsBalances(wallets: string[], tokens: MintableToken[]) {
  const tokensWithNames = await Promise.all(
    tokens.map(async (token) => [await token.name(), token] as const)
  );

  const balances = await Promise.all(
    wallets.map(async (wallet) => {
      const balances: Record<string, number | string> = await getWalletBalances(
        wallet,
        tokensWithNames
      );
      balances['address'] = wallet;
      return balances;
    })
  );

  console.table(balances, ['address', ...tokensWithNames.map(([name]) => name)]);
}
