import { useState } from 'react';
import Floater from 'react-floater';
import { Button } from '@heroui/react';

import Column from '../components/Column';

export default function ControlledMode({ cb }: any) {
  const [isOpen, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(s => !s);
  };

  return (
    <Column>
      <Floater
        callback={cb}
        content={
          <div>
            <p className="font-bold text-center text-lg">I'm a controlled and centered tooltip</p>
            <p className="text-center">The parent control my status</p>
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
            <Button className="bg-black text-white" onPress={handleClick} size="sm">
              Close
            </Button>
          </footer>
        }
        open={isOpen}
        placement="center"
        styles={{
          options: {
            zIndex: 1000,
          },
          floater: {
            maxWidth: 500,
            width: '100%',
          },
        }}
      />
      <Button color="primary" onPress={handleClick} size="sm">
        Controlled floater
      </Button>
    </Column>
  );
}
