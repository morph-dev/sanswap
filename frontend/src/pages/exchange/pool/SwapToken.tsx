import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ChangeEvent, useMemo } from 'react';
import { PoolToken } from '../../../utils/types';

export enum SwapTokenMode {
  SELL = 'sell',
  BUY = 'buy',
  NONE = 'none',
}

export type SwapTokenState = {
  mode: SwapTokenMode;
  valueAsString: string;
  valueAsNumber: number;
};

export function defaultSwapTokenState(): SwapTokenState {
  return {
    mode: SwapTokenMode.NONE,
    valueAsString: '0',
    valueAsNumber: 0,
  };
}

export type SwapTokenProps = {
  token: PoolToken;
  state: SwapTokenState;
  onStateChange: (state: SwapTokenState) => void;
};

export default function SwapToken({ token, state, onStateChange }: SwapTokenProps) {
  const onModeChange = useMemo(() => {
    return (e: ChangeEvent<HTMLSelectElement>) => {
      const mode = e.target.value as SwapTokenMode;
      let valueAsString = state.valueAsNumber.toString();
      let valueAsNumber = state.valueAsNumber;
      if (mode === SwapTokenMode.BUY) {
        valueAsString = '?';
        valueAsNumber = 0;
      } else if (mode === SwapTokenMode.NONE) {
        valueAsString = '0';
        valueAsNumber = 0;
      }
      mode === SwapTokenMode.SELL ? String(state.valueAsNumber) : '?';
      onStateChange({
        mode,
        valueAsString,
        valueAsNumber,
      });
    };
  }, [state, onStateChange]);

  const onValueChange = useMemo(() => {
    return (valueAsString: string, valueAsNumber: number) =>
      onStateChange({
        ...state,
        valueAsString,
        valueAsNumber,
      });
  }, [state, onStateChange]);

  const valueInputEnabled = state.mode === SwapTokenMode.SELL;

  return (
    <VStack w={32}>
      <Text>{token.symbol}</Text>
      <Select w="auto" onChange={onModeChange} value={state.mode}>
        <option value={SwapTokenMode.SELL}>Sell</option>
        <option value={SwapTokenMode.BUY}>Buy</option>
        <option value={SwapTokenMode.NONE}>None</option>
      </Select>
      <NumberInput
        isDisabled={!valueInputEnabled}
        min={0}
        onChange={onValueChange}
        value={state.valueAsString}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </VStack>
  );
}
