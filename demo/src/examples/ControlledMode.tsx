import { useState } from 'react';
import Floater from 'react-floater';
import { Box, Button, Paragraph } from '@gilbarbara/components';

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
          <Box>
            <Paragraph align="center" bold size="lg">
              I'm a controlled and centered tooltip
            </Paragraph>
            <Paragraph align="center">The parent control my status</Paragraph>
          </Box>
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
            <Button bg="black" onClick={handleClick} size="sm">
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
      <Button onClick={handleClick} size="sm">
        Controlled floater
      </Button>
    </Column>
  );
}
