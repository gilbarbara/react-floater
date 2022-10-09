import { ReactNode } from 'react';
import { Box, BoxProps } from '@gilbarbara/components';

interface Props extends BoxProps {
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
