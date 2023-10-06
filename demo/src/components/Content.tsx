import { ReactNode } from 'react';
import { Box, BoxProps } from '@gilbarbara/components';

interface Props extends BoxProps {
  children: ReactNode;
  spaced?: boolean;
}

export default function Content({ children, spaced, ...rest }: Props) {
  if (spaced) {
    return (
      <Box
        align="center"
        display="flex"
        justify="space-between"
        maxWidth={500}
        mx="auto"
        wrap="wrap"
        {...rest}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box maxWidth={500} mx="auto" {...rest}>
      {children}
    </Box>
  );
}
