import { ReactNode } from 'react';
import { Box, Props as ComponentsProps } from '@gilbarbara/components';

interface Props extends ComponentsProps.BoxProps {
  children: ReactNode;
  gray?: boolean;
}

export default function Block({ children, gray, ...rest }: Props) {
  return (
    <Box bg={gray ? 'gray.100' : 'white'} pb="xl" pt="xl" px="xl" textAlign="center" {...rest}>
      {children}
    </Box>
  );
}
