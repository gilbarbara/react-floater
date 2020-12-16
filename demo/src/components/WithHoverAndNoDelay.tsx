import React from 'react';
import Floater from 'react-floater';

export default function WithHoverAndNoDelay({ cb }: any) {
  return (
    <div>
      <Floater
        callback={cb}
        content={<div>I can be triggered by click or hover (on devices with a mouse)</div>}
        disableHoverToClick
        event="hover"
        eventDelay={0}
        placement="top"
        title="Events"
      >
        <button type="button">HOVER</button>
      </Floater>
      <p>no delay (0)</p>
    </div>
  );
}
