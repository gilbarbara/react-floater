import Floater from 'react-floater';
import { Button } from '@heroui/react';

export default function WithCustomStyles({ cb }: any) {
  return (
    <Floater
      callback={cb}
      content={
        <p>You can change the UI completely. Also control placement, offset, flip and much more.</p>
      }
      footer="I should move down on mobile"
      offset={0}
      placement="right-end"
      styles={{
        floater: {
          filter: 'none',
        },
        container: {
          backgroundColor: '#000',
          borderRadius: 5,
          color: '#fff',
          filter: 'none',
          minHeight: 'none',
          maxWidth: 100,
          padding: 10,
          textAlign: 'right',
        },
        arrow: {
          base: 10,
          color: '#000',
          size: 8,
        },
      }}
      title={
        <h3 className="text-lg font-bold">
          I'm super customizable{' '}
          <span aria-label="Smile with Sunglasses" role="img">
            😎
          </span>
        </h3>
      }
    >
      <Button color="primary" size="sm">
        RIGHT
      </Button>
    </Floater>
  );
}
