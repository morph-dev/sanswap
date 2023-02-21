import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

export default function Chain() {
  const toast = useToast();

  const { chain } = useNetwork();
  const { chains, isLoading, switchNetworkAsync } = useSwitchNetwork();

  const errorHandler = useCallback(
    (title: string) => {
      return (error: Error) => {
        toast({
          title,
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      };
    },
    [toast]
  );

  if (!chain) {
    return <Text>No chain!</Text>;
  }

  if (!switchNetworkAsync) {
    return <Text>Chain is not supported!</Text>;
  }

  const isChainSupported = chains.some((c) => c.id === chain.id);

  return (
    <Box>
      <Menu placement="bottom">
        <MenuButton as={Button} isLoading={isLoading}>
          {isChainSupported ? chain.name : 'Unsupported Chain'}
        </MenuButton>
        <MenuList>
          {chains
            .filter((c) => c.id !== chain.id)
            .map((c) => (
              <MenuItem
                key={c.name}
                onClick={() => {
                  switchNetworkAsync(c.id).catch(errorHandler('Changing chain failed!'));
                }}
              >
                {c.name}
              </MenuItem>
            ))}
        </MenuList>
      </Menu>
    </Box>
  );
}
