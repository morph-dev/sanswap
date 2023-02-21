import { Box, Button, HStack, Text } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

type ItemProps = PropsWithChildren & {
  to: string;
};

function Item({ to, children }: PropsWithChildren<{ to: string }>) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <Button colorScheme={isActive ? 'blue' : 'gray'} variant="link">
          {children}
        </Button>
      )}
    </NavLink>
  );
}

export default function Navigation() {
  return (
    <HStack>
      <HStack>
        <Item to="/exchange">Exchange</Item>
        <Item to="/bank">Bank</Item>
      </HStack>
    </HStack>
  );
}
