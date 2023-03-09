import { VStack } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import Loading from '../../../components/loading/Loading';
import { useSanSwapPoolReserves } from '../../../generated/blockchain';
import { useTokenContext } from '../../../providers/TokenContext';
import { Address, Pool as PoolType, PoolToken } from '../../../utils/types';
import LiquidityCard from './LiquidityCard';
import SwapCard from './SwapCard';

export type PoolProps = {
  pool: PoolType;
};

export default function Pool({ pool }: PoolProps) {
  const { tokens: allTokens, fetchAndUpdateTokens } = useTokenContext();

  const { data: reserves } = useSanSwapPoolReserves({ address: pool.address });

  const [tokens, setTokens] = useState<PoolToken[] | null>(null);

  const tokenAddresses = useMemo(() => [pool.tokenA, pool.tokenB, pool.tokenC], [pool]);

  useEffect(() => {
    if (!reserves) {
      return;
    }

    const missingTokens: Address[] = [];

    const result: PoolToken[] = [];
    for (let i = 0; i < 3; i++) {
      const tokenAddress = tokenAddresses[i];
      const token = allTokens[tokenAddress];
      if (!token) {
        missingTokens.push(tokenAddress);
        continue;
      }
      result.push({
        ...token,
        reserves: parseFloat(ethers.utils.formatUnits(reserves[i], token.decimals)),
      });
    }

    if (missingTokens.length > 0) {
      fetchAndUpdateTokens(missingTokens);
      return;
    }

    setTokens(result);
  }, [pool, reserves, allTokens, fetchAndUpdateTokens, tokenAddresses]);

  if (!tokens) {
    return <Loading />;
  }

  return (
    <VStack align="stretch">
      <LiquidityCard tokens={tokens} />
      <SwapCard tokens={tokens} />
    </VStack>
  );
}
