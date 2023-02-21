import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { prepareWriteContract, writeContract } from '@wagmi/core';
import { parseEther } from 'ethers/lib/utils.js';
import { useState } from 'react';
import { useNetwork } from 'wagmi';
import { bankConfig } from '../../generated/blockchain';
import { BankActionType, useBankDispatchContext } from '../../providers/BankContext';

export default function NewToken() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chain } = useNetwork();

  const bankDispatch = useBankDispatchContext();

  const toast = useToast();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');

  const onCreateClick = async () => {
    if (!chain || !(chain.id in bankConfig.address)) {
      toast({
        title: 'Unknown Bank address!',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const config = await prepareWriteContract({
      abi: bankConfig.abi,
      address: bankConfig.address[chain.id as keyof typeof bankConfig.address],
      functionName: 'createToken',
      args: [name, symbol, parseEther('1000000')],
    });
    toast.promise(
      writeContract(config).finally(() => {
        bankDispatch({ type: BankActionType.RESET_TOKENS });
      }),
      {
        success: {
          title: 'Token created!',
        },
        error: (error) => ({
          title: 'Error creating token!',
          description: error.message,
          duration: 5000,
          isClosable: true,
        }),
        loading: { title: 'Creating token!' },
      }
    );
  };

  return (
    <>
      <Button onClick={onOpen}>Create new</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table>
                <Tbody>
                  <Tr>
                    <Td>Name</Td>
                    <Td>
                      <Input
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Mintable Token"
                        value={name}
                      />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Symbol</Td>
                    <Td>
                      <Input
                        onChange={(event) => setSymbol(event.target.value)}
                        placeholder="MNT"
                        value={symbol}
                      />
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onCreateClick}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
