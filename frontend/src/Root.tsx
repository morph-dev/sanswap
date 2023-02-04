import { Box, Button } from '@chakra-ui/react';
import { useAccount, useConnect } from 'wagmi';
import { useBankTokenSize } from './generated/blockchain';

export default function Root() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const tokenSize = useBankTokenSize();

  return (
    <Box w="100%" p={4} gap={4} bg="green" color="white">
      <Box fontSize="xl" fontWeight="bold">
        SanSwap
      </Box>
      {isConnected ? (
        address
      ) : (
        <Button colorScheme="pink" onClick={() => connect({ connector: connectors[0] })}>
          connect
        </Button>
      )}
      <br />
      {tokenSize.isSuccess ? tokenSize.data?.toNumber() : tokenSize.status}
    </Box>
  );
}
