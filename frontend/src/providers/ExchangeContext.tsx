import { BigNumber, ethers } from 'ethers';
import { createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { readContracts, useChainId, useProvider } from 'wagmi';
import {
  sanSwapPoolABI,
  useSanSwapFactory,
  useSanSwapFactoryGetPoolCount,
} from '../generated/blockchain';
import { createContextHook } from '../utils/contextUtils';
import { Pool } from '../utils/types';

export type ExchangeState = {
  pools: Pool[] | null;
};

const ExchangeContext = createContext<ExchangeState | null>(null);

export const useExchangeContext = createContextHook(ExchangeContext);

export function ExchangeProvider({ children }: PropsWithChildren) {
  const chainId = useChainId();
  const provider = useProvider();

  const [pools, setPools] = useState<Pool[] | null>(null);

  const factory = useSanSwapFactory({ signerOrProvider: provider });

  const { data: poolCount } = useSanSwapFactoryGetPoolCount();

  // Reset pools on chain change.
  useEffect(() => setPools(null), [chainId]);

  const fetchPool = useCallback(
    async (index: number): Promise<Pool> => {
      if (!factory) {
        throw Error('Pool factory unknown');
      }
      const poolAddress = await factory
        .allPools(BigNumber.from(index))
        .then(ethers.utils.getAddress);

      const poolReadConfig = { address: poolAddress, abi: sanSwapPoolABI };
      const [symbol, tokenA, tokenB, tokenC] = await readContracts({
        contracts: [
          { ...poolReadConfig, functionName: 'symbol' },
          { ...poolReadConfig, functionName: 'tokenA' },
          { ...poolReadConfig, functionName: 'tokenB' },
          { ...poolReadConfig, functionName: 'tokenC' },
        ],
      });
      return {
        address: poolAddress,
        symbol: symbol,
        tokenA: ethers.utils.getAddress(tokenA),
        tokenB: ethers.utils.getAddress(tokenB),
        tokenC: ethers.utils.getAddress(tokenC),
      };
    },
    [factory]
  );

  useEffect(() => {
    const count = poolCount?.toNumber() ?? 0;
    if (count <= (pools?.length ?? 0)) {
      return;
    }

    let aborted = false;

    const fetchPools = async () => {
      const newPools = [...(pools ?? [])];
      while (!aborted && newPools.length < count) {
        newPools.push(await fetchPool(newPools.length));
      }

      if (!aborted) {
        setPools(newPools);
      }
    };

    fetchPools().catch(console.error);

    return () => {
      aborted = true;
    };
  }, [pools, poolCount, fetchPool]);

  const state: ExchangeState = {
    pools,
  };
  return <ExchangeContext.Provider value={state}>{children}</ExchangeContext.Provider>;
}
