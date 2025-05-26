import Floater from 'react-floater';
import { Button } from '@heroui/react';

import Column from '../components/Column';

export default function WithHoverAndNoDelay({ cb }: any) {
  return (
    <Column>
      <Floater
        callback={cb}
        content={<p>I can be triggered by click or hover (on devices with a mouse)</p>}
        disableHoverToClick
        event="hover"
        eventDelay={0}
        placement="top"
        title="Events"
      >
        <Button color="primary" size="sm">
          HOVER
        </Button>
      </Floater>
      <p className="p-1">no delay (0)</p>
    </Column>
  );
}
