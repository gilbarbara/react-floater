import { ReactNode } from 'react';
import { Flex, FlexProps } from '@gilbarbara/components';

interface Props extends FlexProps {
  children: ReactNode;
  gray?: boolean;
}

export default function Block({ children, gray, ...rest }: Props) {
  return (
    <Flex
      align="center"
      bg={gray ? 'gray.100' : 'white'}
      data-component-name="Block"
      direction="column"
      p="xl"
      textAlign="center"
      {...rest}
    >
      {children}
    </Flex>
  );
}
