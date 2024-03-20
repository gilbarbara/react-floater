import Floater from 'react-floater';
import { Button, Paragraph } from '@gilbarbara/components';

import Column from '../components/Column';

export default function WithHoverAndNoDelay({ cb }: any) {
  return (
    <Column>
      <Floater
        callback={cb}
        content={
          <Paragraph>I can be triggered by click or hover (on devices with a mouse)</Paragraph>
        }
        disableHoverToClick
        event="hover"
        eventDelay={0}
        placement="top"
        title="Events"
      >
        <Button size="sm">HOVER</Button>
      </Floater>
      <Paragraph mt="xs">no delay (0)</Paragraph>
    </Column>
  );
}
