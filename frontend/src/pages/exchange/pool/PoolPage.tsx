import { ArrowBackIcon } from '@chakra-ui/icons';
import { Button, Heading, HStack, VStack } from '@chakra-ui/react';
import { Navigate, useNavigate, useParams } from 'react-router';
import Loading from '../../../components/loading/Loading';
import { useExchangeContext } from '../../../providers/ExchangeContext';
import Pool from './Pool';

export default function PoolPage() {
  const { poolId } = useParams();
  const navigate = useNavigate();

  const { pools } = useExchangeContext();

  if (!pools) {
    return <Loading />;
  }

  const pool = pools.find((p) => p.address.toLowerCase() === poolId?.toLowerCase());

  if (!pool) {
    return <Navigate to="/exchange" />;
  }

  return (
    <VStack>
      <VStack align="stretch">
        <HStack>
          <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate('/exchange')}>
            Back
          </Button>
          <Heading size="md">{pool.symbol}</Heading>
        </HStack>
        <Pool pool={pool} />
      </VStack>
    </VStack>
  );
}
