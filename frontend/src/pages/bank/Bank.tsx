import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useBankContext } from '../../providers/BankContext';
import NewToken from './NewToken';

export default function Bank() {
  const bankState = useBankContext();

  return (
    <VStack>
      <Card>
        <CardHeader>
          <Flex>
            <Heading size="md">Tokens</Heading>
            <Spacer />
            <NewToken />
          </Flex>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>symbol</Th>
                  <Th>address</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {bankState.tokens.map((token) => (
                  <Tr key={token.address}>
                    <Td>{token.name}</Td>
                    <Td>{token.symbol}</Td>
                    <Td fontFamily="mono">{token.address}</Td>
                    <Td>
                      <Button>mint</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </VStack>
  );
}
