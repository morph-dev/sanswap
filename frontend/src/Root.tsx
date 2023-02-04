import { Box, Button } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useAccount, useConnect, useContractRead } from 'wagmi';
import { BANK_ADDRESS } from './constants';
import bankAbi from './contracts/Bank.abi.json';

export default function Root() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const { data: tokenSize, status: tokenSizeStatus } = useContractRead({
    address: BANK_ADDRESS,
    abi: bankAbi,
    functionName: 'tokenSize',
    watch: true,
  });

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
      {tokenSizeStatus == 'success' ? (tokenSize as BigNumber).toNumber() : tokenSizeStatus}
    </Box>
  );
}
