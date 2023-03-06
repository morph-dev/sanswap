import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useExchangeContext } from '../../../providers/ExchangeContext';
import PoolItem from './PoolItem';

export default function PoolList() {
  const { pools } = useExchangeContext();

  return (
    <VStack>
      <Card>
        <CardHeader>Pools</CardHeader>
        <CardBody>
          <Table>
            <Thead>
              <Tr>
                <Th>Pool</Th>
                <Th>address</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pools.map((pool) => (
                <PoolItem pool={pool} key={pool.address} />
              ))}
            </Tbody>
          </Table>
        </CardBody>
        <CardFooter>
          <Button onClick={() => alert('NOT IMPLEMENTED')}>Create</Button>
        </CardFooter>
      </Card>
    </VStack>
  );
}
