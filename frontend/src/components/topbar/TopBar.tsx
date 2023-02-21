import { Flex, Spacer } from '@chakra-ui/react';
import Account from './Account';
import Navigation from './Navigation';

export default function TopBar() {
  return (
    <Flex p={2}>
      <Navigation />
      <Spacer />
      <Account />
    </Flex>
  );
}
