import { ReactNode } from 'react';
import { Box, BoxProps } from '@gilbarbara/components';

interface Props extends BoxProps {
  children: ReactNode;
  gray?: boolean;
}

export default function Block({ children, gray, ...rest }: Props) {
  return (
    <Box
      pb="xl"
      pt="xl"
      px="xl"
      shade="lightest"
      textAlign="center"
      variant={gray ? 'gray' : 'white'}
      {...rest}
    >
      {children}
    </Box>
  );
}
