import Floater from 'react-floater';
import { Button, Paragraph } from '@gilbarbara/components';

import Column from '../components/Column';

export default function WithHoverDefault({ cb }: any) {
  return (
    <Column>
      <Floater
        callback={cb}
        content={
          <Paragraph>I can be triggered by click or hover (on devices with a mouse)</Paragraph>
        }
        event="hover"
        placement="top"
        title="Events"
      >
        <Button size="sm">HOVER</Button>
      </Floater>
      <Paragraph mt="xs">default delay (0.4s)</Paragraph>
    </Column>
  );
}
