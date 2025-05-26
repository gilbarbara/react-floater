import Floater from 'react-floater';
import { Button } from '@heroui/react';
import { Menu } from 'lucide-react';

export default function WithPosition({ cb }: any) {
  return (
    <div className="fixed top-4 left-4">
      <Floater
        callback={cb}
        content={<div>I live up here on large screens!</div>}
        placement="bottom-end"
        styles={{
          container: {
            padding: '16px',
            fontSize: 24,
            textAlign: 'center',
          },
          close: {
            right: 'auto',
            left: 0,
          },
        }}
      >
        <Button color="primary" isIconOnly size="sm">
          <Menu size={18} />
        </Button>
      </Floater>
    </div>
  );
}
