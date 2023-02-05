import { Flex, Spacer, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
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
