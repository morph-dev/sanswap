import { Button, Td, Text, Tr } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pool } from '../../../utils/types';

export type PoolItemProps = {
  pool: Pool;
};

export default function PoolItem({ pool }: PropsWithChildren<PoolItemProps>) {
  const navigate = useNavigate();
  return (
    <Tr>
      <Td>{pool.symbol}</Td>
      <Td>
        <Text fontFamily="mono">{pool.address}</Text>
      </Td>
      <Td>
        <Button onClick={() => navigate(pool.address)}>Open</Button>
      </Td>
    </Tr>
  );
}
