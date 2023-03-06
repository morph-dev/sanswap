import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { PoolToken } from '../../../utils/types';

export type LiquidityCardProps = {
  tokens: PoolToken[];
};

export default function LiquidityCard({ tokens }: LiquidityCardProps) {
  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between" w="full">
          <Heading size="md">Liquidity</Heading>
          <ButtonGroup>
            <Button>Add</Button>
            <Button>Remove</Button>
          </ButtonGroup>
        </HStack>
      </CardHeader>
      <CardBody>
        <Table>
          <Thead>
            <Tr>
              <Th>token</Th>
              <Th>reserves</Th>
              {tokens.map((token) => (
                <Th key={token.address} textTransform="none">
                  1 {token.symbol}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {tokens.map((token) => (
              <Tr key={token.address}>
                <Td>{token.symbol}</Td>
                <Td>{token.reserves}</Td>
                {tokens.map((otherToken) => (
                  <Td key={otherToken.address}>
                    {(token.reserves / otherToken.reserves).toPrecision(4)}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
