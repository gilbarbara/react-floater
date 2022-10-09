import { useState } from 'react';
import Floater from 'react-floater';
import styled from '@emotion/styled';
import { Button, Paragraph } from '@gilbarbara/components';

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
`;

export default function FloaterOverlay({ cb }: any) {
  const [isOpen, setOpen] = useState(false);

  const callback = (action: any, props: any) => {
    cb(action, props);

    setOpen(action === 'open');
  };

  const handleClick = () => {
    setOpen(s => !s);
  };

  return (
    <div>
      <Floater
        callback={callback}
        content={<Paragraph>I have an invisible overlay that will close the floater</Paragraph>}
        open={isOpen}
        placement="top"
        styles={{ options: { zIndex: 250 } }}
      >
        <Button onClick={handleClick} size="sm">
          Click me
        </Button>
      </Floater>
      {isOpen && <Overlay onClick={handleClick} />}
    </div>
  );
}
