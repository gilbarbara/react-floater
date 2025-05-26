import { useState } from 'react';
import Floater from 'react-floater';
import { Button } from '@heroui/react';

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
    <>
      <Floater
        callback={callback}
        content={<p>I have an invisible overlay that will close the floater</p>}
        open={isOpen}
        placement="top"
        styles={{ options: { zIndex: 250 } }}
      >
        <Button color="primary" onPress={handleClick} size="sm">
          Click me
        </Button>
      </Floater>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/10" onClick={handleClick} role="presentation" />
      )}
    </>
  );
}
