import { ArrowBackIcon } from '@chakra-ui/icons';
import { Button, Heading, HStack, VStack } from '@chakra-ui/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useExchangeContext } from '../../../providers/ExchangeContext';
import { PoolToken } from '../../../utils/types';
import LiquidityCard from './LiquidityCard';
import SwapCard from './SwapCard';

export default function Pool() {
  const { pools } = useExchangeContext();
  const { poolId } = useParams();
  const navigate = useNavigate();

  const pool = pools.find((p) => p.address.toLowerCase() === poolId?.toLowerCase());
  if (!pool) {
    return <Navigate to="/exchange" />;
  }

  const tokens: PoolToken[] = [
    {
      address: '0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67',
      name: 'USD stable coin',
      symbol: 'mUSD',
      decimals: 18,
      reserves: 1000000000,
    },
    {
      address: '0x75537828f2ce51be7289709686A69CbFDbB714F1',
      name: 'Wrapped ETH',
      symbol: 'mETH',
      decimals: 18,
      reserves: 49400000,
    },
    {
      address: '0xa783CDc72e34a174CCa57a6d9a74904d0Bec05A9',
      name: 'Wrapped BTC',
      symbol: 'mBTC',
      decimals: 18,
      reserves: 3400000,
    },
  ];

  return (
    <VStack>
      <VStack align="stretch">
        <HStack>
          <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate('/exchange')}>
            Back
          </Button>
          <Heading size="md">{pool.symbol}</Heading>
        </HStack>
        <LiquidityCard tokens={tokens} />
        <SwapCard pool={pool} tokens={tokens} />
      </VStack>
    </VStack>
  );
}
