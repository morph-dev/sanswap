import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import SimpleCart from '../../../components/simpleCard/SimpleCard';
import { Address, PoolToken } from '../../../utils/types';
import SwapToken, { defaultSwapTokenState, SwapTokenMode, SwapTokenState } from './SwapToken';

export type SwapCardProps = {
  tokens: PoolToken[];
};

export default function SwapCard({ tokens }: SwapCardProps) {
  const [tokenStates, setTokenStates] = useState<Record<Address, SwapTokenState>>({});

  const allHaveState = tokens.every((token) => token.address in tokenStates);

  if (!allHaveState) {
    setTokenStates(
      Object.fromEntries(
        tokens.map<[Address, SwapTokenState]>((token) => [
          token.address,
          tokenStates[token.address] ?? defaultSwapTokenState(),
        ])
      )
    );

    return (
      <SimpleCart header="Swap">
        <Spinner />
      </SimpleCart>
    );
  }

  const hasBuy = tokens.some((token) => tokenStates[token.address].mode === SwapTokenMode.BUY);
  const hasSell = tokens.some((token) => tokenStates[token.address].mode === SwapTokenMode.SELL);

  const swapEnabled = hasBuy && hasSell;

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Swap</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing="4">
          <HStack justify="space-evenly" w="full">
            {tokens.map((token) => (
              <SwapToken
                key={token.address}
                token={token}
                state={tokenStates[token.address]}
                onStateChange={(status) =>
                  setTokenStates({
                    ...tokenStates,
                    [token.address]: status,
                  })
                }
              />
            ))}
          </HStack>
          {swapEnabled ? null : <Text color="crimson">At least one buy and one sell required</Text>}
        </VStack>
      </CardBody>
      <CardFooter>
        <HStack justify="end" w="full">
          <ButtonGroup isDisabled={!swapEnabled}>
            <Button>Estimate</Button>
            <Button>Swap</Button>
          </ButtonGroup>
        </HStack>
      </CardFooter>
    </Card>
  );
}
