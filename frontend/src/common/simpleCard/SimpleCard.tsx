import { Card, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import { PropsWithChildren, ReactNode } from 'react';

export type SimpleCardProps = {
  header: string | ReactNode;
};

export default function SimpleCart({ header, children }: PropsWithChildren<SimpleCardProps>) {
  const headerComponent =
    typeof header === 'string' ? <Heading size="md">{header}</Heading> : header;

  return (
    <Card>
      <CardHeader>{headerComponent}</CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}
