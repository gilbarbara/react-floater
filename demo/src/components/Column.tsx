import { ReactNode } from 'react';
import { FlexCenter, FlexProps } from '@gilbarbara/components';

interface Props extends FlexProps {
  children: ReactNode;
}

export default function Column(props: Props) {
  return <FlexCenter align="center" data-component-name="Column" flex {...props} />;
}
