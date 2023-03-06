import { createContext, PropsWithChildren } from 'react';
import { createContextHook } from '../utils/contextUtils';
import { Pool } from '../utils/types';

export type ExchangeState = {
  pools: Pool[];
};

const ExchangeContext = createContext<ExchangeState | null>(null);

export const useExchangeContext = createContextHook(ExchangeContext);

export function ExchangeProvider({ children }: PropsWithChildren) {
  // TODO: Make this programmable and updateable.
  const state: ExchangeState = {
    pools: [
      {
        address: '0xd8058efe0198ae9dD7D563e1b4938Dcbc86A1F81',
        symbol: 'SS-mUSD-mETH-mBTC',
        tokenA: '0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67',
        tokenB: '0x75537828f2ce51be7289709686A69CbFDbB714F1',
        tokenC: '0xE451980132E65465d0a498c53f0b5227326Dd73F',
      },
      {
        address: '0x6D544390Eb535d61e196c87d6B9c80dCD8628Acd',
        symbol: 'SS-mUSD-mETH-mSS',
        tokenA: '0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67',
        tokenB: '0x75537828f2ce51be7289709686A69CbFDbB714F1',
        tokenC: '0xa783CDc72e34a174CCa57a6d9a74904d0Bec05A9',
      },
    ],
  };
  return <ExchangeContext.Provider value={state}>{children}</ExchangeContext.Provider>;
}
