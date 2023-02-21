export type Address = `0x${string}`;

export type Token = {
  address: Address;
  bankId: number;
  name: string;
  symbol: string;
  decimals: number;
};

export type Pool = {
  address: Address;
  tokenA: Address;
  tokenB: Address;
  tokenC: Address;
};
