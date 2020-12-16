import React from 'react';
import Floater from 'react-floater';

export default function WithHoverCustomDelay({ cb }: any) {
  return (
    <div>
      <Floater
        callback={cb}
        content={
          <div style={{ fontSize: 18 }}>
            I have an <b>eventDelay</b> prop for <i>hover</i> event that can be adjusted (move you
            mouse away)!
          </div>
        }
        event="hover"
        eventDelay={2.5}
        placement="top"
      >
        <button type="button">HOVER</button>
      </Floater>
      <p>2.5s delay</p>
    </div>
  );
}
