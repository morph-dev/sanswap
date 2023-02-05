import { Button, HStack, Text, useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { elliptAddress } from '../../utils/textUtils';
import Chain from './Chain';

export default function Account() {
  const toast = useToast();

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isLoading: connectIsLoading } = useConnect();
  const { disconnectAsync } = useDisconnect();

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

  if (!isConnected) {
    const connector = connectors[0];
    return (
      <Button
        isLoading={connectIsLoading}
        onClick={() => connectAsync({ connector }).catch(errorHandler('Connection failed!'))}
      >
        Connect
      </Button>
    );
  }

  return (
    <HStack>
      {address ? <Text fontFamily="mono">{elliptAddress(address)}</Text> : null}
      <Chain />
      <Button onClick={() => disconnectAsync().catch(errorHandler('Disconnection failed!'))}>
        Disconnect
      </Button>
    </HStack>
  );
}
