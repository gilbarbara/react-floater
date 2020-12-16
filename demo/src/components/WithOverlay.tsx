import React, { useState } from 'react';
import Floater from 'react-floater';
import styled from 'styled-components';

function Button({ innerRef, ...rest }: any) {
  return <button ref={innerRef} type="button" {...rest} />;
}

const Overlay = styled.div`
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
    setOpen((s) => !s);
  };

  return (
    <div>
      <Floater
        callback={callback}
        content={
          <div>
            <p>I have an invisible overlay that will close the floater</p>
          </div>
        }
        open={isOpen}
        placement="top"
        styles={{ options: { zIndex: 250 } }}
      >
        <Button onClick={handleClick}>Click me</Button>
      </Floater>
      {isOpen && <Overlay onClick={handleClick} />}
    </div>
  );
}
