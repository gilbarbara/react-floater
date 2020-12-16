import React, { useState } from 'react';
import Floater from 'react-floater';

export default function ControlledMode({ cb }: any) {
  const [isOpen, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((s) => !s);
  };

  return (
    <div>
      <Floater
        callback={cb}
        content={
          <div style={{ fontSize: 22, textAlign: 'center' }}>
            I'm a controlled and centered tooltip.
            <br />
            My parent control my status
          </div>
        }
        footer={
          <footer
            style={{
              borderTop: '2px solid #f04',
              marginTop: 20,
              paddingTop: 20,
              textAlign: 'right',
            }}
          >
            <button onClick={handleClick} type="button">
              Close
            </button>
          </footer>
        }
        open={isOpen}
        placement="center"
        styles={{
          floater: {
            maxWidth: 500,
            width: '100%',
          },
        }}
      />
      <button onClick={handleClick} type="button">
        Controlled floater
      </button>
    </div>
  );
}
