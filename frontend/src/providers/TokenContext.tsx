import { ethers } from 'ethers';
import { createContext, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { readContracts, useChainId } from 'wagmi';
import { ierc20MetadataABI } from '../generated/blockchain';
import { createContextHook } from '../utils/contextUtils';
import { Address, Token } from '../utils/types';

export type TokenState = {
  tokens: Record<Address, Token>;
  fetchAndUpdateTokens: (address: Address[]) => void;
};

const TokenContext = createContext<TokenState | null>(null);

export const useTokenContext = createContextHook(TokenContext);

export function TokenProvider({ children }: PropsWithChildren) {
  const chainId = useChainId();
  const [tokens, setTokens] = useState<Record<Address, Token>>({});

  const [tokensToFetch, setTokensToFetch] = useState<Address[]>([]);

  // Reset tokens on chain change.
  useEffect(() => {
    setTokens({});
    setTokensToFetch([]);
  }, [chainId]);

  const fetchToken = useCallback(async (address: Address): Promise<Token> => {
    const checksumAddress = ethers.utils.getAddress(address);
    const erc20ReadConfig = {
      address: checksumAddress,
      abi: ierc20MetadataABI,
    };
    const [name, symbol, decimals] = await readContracts({
      contracts: [
        { ...erc20ReadConfig, functionName: 'name' },
        { ...erc20ReadConfig, functionName: 'symbol' },
        { ...erc20ReadConfig, functionName: 'decimals' },
      ],
    });
    return {
      address: checksumAddress,
      name,
      symbol,
      decimals,
    };
  }, []);

  useEffect(() => {
    if (tokensToFetch.length == 0) {
      return;
    }
    let aborted = false;

    const fetchAndUpdate = async () => {
      const newTokens = { ...tokens };
      for (const tokenAddress of tokensToFetch) {
        const checksumAddress = ethers.utils.getAddress(tokenAddress);
        if (aborted) {
          return;
        }
        newTokens[checksumAddress] = await fetchToken(checksumAddress);
      }
      if (!aborted) {
        setTokens(newTokens);
        setTokensToFetch([]);
      }
    };
    fetchAndUpdate().catch(console.error);

    return () => {
      aborted = true;
    };
  }, [tokens, tokensToFetch, fetchToken]);

  const fetchAndUpdateTokens = useCallback(
    (addresses: Address[]) =>
      setTokensToFetch((oldTokensToFetch) => {
        const newTokensToFetch = [...oldTokensToFetch];
        let modified = false;
        for (const address of addresses) {
          const checksumAddress = ethers.utils.getAddress(address);
          if (checksumAddress in tokens) {
            continue;
          }
          if (newTokensToFetch.indexOf(checksumAddress) < 0) {
            newTokensToFetch.push(checksumAddress);
            modified = true;
          }
        }

        return modified ? newTokensToFetch : oldTokensToFetch;
      }),
    [tokens, setTokensToFetch]
  );

  const state: TokenState = {
    tokens,
    fetchAndUpdateTokens,
  };
  return <TokenContext.Provider value={state}>{children}</TokenContext.Provider>;
}
