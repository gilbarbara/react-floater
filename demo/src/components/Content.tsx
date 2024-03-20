import { ReactNode } from 'react';
import { Flex, FlexProps } from '@gilbarbara/components';

interface Props extends FlexProps {
  children: ReactNode;
}

export default function Content(props: Props) {
  return (
    <Flex
      data-component-name="Content"
      justify="space-between"
      maxWidth={500}
      mx="auto"
      width="100%"
      wrap="wrap"
      {...props}
    />
  );
}
