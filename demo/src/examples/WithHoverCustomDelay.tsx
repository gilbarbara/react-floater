import Floater from 'react-floater';
import { Button } from '@heroui/react';

import Column from '../components/Column';

export default function WithHoverCustomDelay({ cb }: any) {
  return (
    <Column>
      <Floater
        callback={cb}
        content={
          <p className="text-large">
            I have an <b>eventDelay</b> prop for <i>hover</i> event that can be adjusted (move you
            mouse away)!
          </p>
        }
        event="hover"
        eventDelay={2.5}
        placement="top"
      >
        <Button color="primary" size="sm">
          HOVER
        </Button>
      </Floater>
      <p className="p-2">2.5s delay</p>
    </Column>
  );
}
