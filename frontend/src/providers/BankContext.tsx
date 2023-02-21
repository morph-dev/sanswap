import { Address, fetchToken, readContract } from '@wagmi/core';
import { BigNumber } from 'ethers';
import { createContext, Dispatch, PropsWithChildren, useEffect, useReducer, useState } from 'react';
import { useNetwork } from 'wagmi';
import { bankConfig, useBankTokenSize } from '../generated/blockchain';
import { createContextHook } from '../utils/contextUtils';
import { Token } from '../utils/types';

export type BankState = {
  tokens: Token[];
};

export enum BankActionType {
  ADD_TOKEN,
  ADD_TOKENS,
  RESET_TOKENS,
}

export type BankAction =
  | {
      type: BankActionType.ADD_TOKEN;
      token: Token;
    }
  | {
      type: BankActionType.ADD_TOKENS;
      tokens: Token[];
    }
  | { type: BankActionType.RESET_TOKENS };

const BankContext = createContext<BankState | null>(null);
const BankDispatchContext = createContext<Dispatch<BankAction> | null>(null);

export const useBankContext = createContextHook(BankContext);
export const useBankDispatchContext = createContextHook(BankDispatchContext);

export function BankProvider({ children }: PropsWithChildren) {
  const { chain, chains } = useNetwork();
  const { data: tokenSize, refetch: tokenSizeRefetch } = useBankTokenSize();

  const [state, dispatch] = useReducer(bankReducer, { tokens: [] });

  const chainId = chain && chains.some((c) => c.id === chain?.id) ? chain.id : 0;

  useEffect(() => {
    tokenSizeRefetch();
    dispatch({ type: BankActionType.RESET_TOKENS });
  }, [chainId, tokenSizeRefetch]);

  const [updatingTokens, setUpdatingTokens] = useState(false);
  useEffect(() => {
    if (updatingTokens) {
      return;
    }
    const tokensInBank = tokenSize ? tokenSize.toNumber() : 0;
    if (tokensInBank === state.tokens.length) {
      return;
    }
    setUpdatingTokens(true);
    updateTokens(chainId, state.tokens, dispatch).finally(() => setUpdatingTokens(false));
  }, [updatingTokens, state.tokens, tokenSize, chainId]);

  return (
    <BankContext.Provider value={state}>
      <BankDispatchContext.Provider value={dispatch}>{children}</BankDispatchContext.Provider>
    </BankContext.Provider>
  );
}

export function bankReducer(prevState: BankState, action: BankAction): BankState {
  switch (action.type) {
    case BankActionType.ADD_TOKEN:
      if (prevState.tokens.some((t) => action.token.address === t.address)) {
        return prevState;
      }
      return {
        ...prevState,
        tokens: [...prevState.tokens, action.token],
      };
    case BankActionType.ADD_TOKENS: {
      const tokensToAdd = action.tokens.filter((token) =>
        prevState.tokens.every((t) => t.address !== token.address)
      );
      return {
        ...prevState,
        tokens: [...prevState.tokens, ...tokensToAdd].sort((t1, t2) => t1.bankId - t2.bankId),
      };
    }
    case BankActionType.RESET_TOKENS:
      return {
        ...prevState,
        tokens: [],
      };
    default:
      return prevState;
  }
}

async function updateTokens(chainId: number, tokens: Token[], dispatch: Dispatch<BankAction>) {
  const config = {
    abi: bankConfig.abi,
    address: bankConfig.address[chainId as keyof typeof bankConfig.address] as Address,
  };
  const tokensInBank = await readContract({ ...config, functionName: 'tokenSize' }).then(
    (tokenSize) => tokenSize.toNumber()
  );

  const tokensToAdd: Token[] = [];

  for (let tokenId = 0; tokenId < tokensInBank; tokenId++) {
    if (tokens.some((t) => t.bankId === tokenId)) {
      continue;
    }
    const address = await readContract({
      ...config,
      functionName: 'tokens',
      args: [BigNumber.from(tokenId)],
    });

    const tokenResult = await fetchToken({ address });
    tokensToAdd.push({
      bankId: tokenId,
      address: tokenResult.address,
      name: tokenResult.name,
      symbol: tokenResult.symbol,
      decimals: tokenResult.decimals,
    });
  }
  dispatch({ type: BankActionType.ADD_TOKENS, tokens: tokensToAdd });
}
