import { Spinner, VStack } from '@chakra-ui/react';

export default function Loading() {
  return (
    <VStack>
      <Spinner size="lg" />
    </VStack>
  );
}
