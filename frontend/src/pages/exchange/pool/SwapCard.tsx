import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Address, PoolToken } from '../../../utils/types';
import SwapToken, { defaultSwapTokenState, SwapTokenMode, SwapTokenState } from './SwapToken';

export type SwapCardProps = {
  tokens: PoolToken[];
};

function defaultTokenStates(tokens: PoolToken[]) {
  return Object.fromEntries(
    tokens.map<[Address, SwapTokenState]>((token) => [token.address, defaultSwapTokenState()])
  );
}

export default function SwapCard({ tokens }: SwapCardProps) {
  const [tokenStates, setTokenStates] = useState<Record<Address, SwapTokenState>>(
    defaultTokenStates(tokens)
  );
  const [estimated, setEstimated] = useState(false);

  const sellTokens = Object.values(tokenStates).filter(
    (tokenState) => tokenState.mode === SwapTokenMode.SELL
  );
  const buyTokens = Object.values(tokenStates).filter(
    (tokenState) => tokenState.mode === SwapTokenMode.BUY
  );

  const sellTokensCount = sellTokens.length;
  const buyTokensCount = buyTokens.length;
  const hasBuyAndSell = sellTokensCount > 0 && buyTokensCount > 0;

  const allSellsPositive = sellTokens.every((tokenStates) => tokenStates.valueAsNumber > 0);

  const swapEnabled = hasBuyAndSell && allSellsPositive;

  const errorMessage = hasBuyAndSell
    ? allSellsPositive
      ? ''
      : 'All sold tokens need to be positive'
    : 'At least one buy and one sell required';

  const estimateSwap = () => {
    if (!swapEnabled) {
      throw Error('Swap not enabled.');
    }
  };

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
                onStateChange={(status) => {
                  setEstimated(false);
                  setTokenStates({
                    ...tokenStates,
                    [token.address]: status,
                  });
                }}
              />
            ))}
          </HStack>
          {swapEnabled ? null : <Text color="crimson">{errorMessage}</Text>}
        </VStack>
      </CardBody>
      <CardFooter>
        <HStack justify="end" w="full">
          <ButtonGroup isDisabled={!swapEnabled}>
            {estimated ? <Button>Swap</Button> : <Button>Estimate</Button>}
          </ButtonGroup>
        </HStack>
      </CardFooter>
    </Card>
  );
}
