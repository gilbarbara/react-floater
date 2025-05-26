import Floater from 'react-floater';
import { Button } from '@heroui/react';

import Column from '../components/Column';

export default function WithHoverDefault({ cb }: any) {
  return (
    <Column>
      <Floater
        callback={cb}
        content={<p>I can be triggered by click or hover (on devices with a mouse)</p>}
        event="hover"
        placement="top"
        title="Events"
      >
        <Button color="primary" size="sm">
          HOVER
        </Button>
      </Floater>
      <p className="p-2">default delay (0.4s)</p>
    </Column>
  );
}
