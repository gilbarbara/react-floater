import Floater from 'react-floater';
import { Button } from '@heroui/react';

export default function WithTitleAndFooter({ cb }: any) {
  return (
    <Floater
      callback={cb}
      content={
        <>
          <p>My content can be anything that can be rendered: numbers, strings, elements.</p>
          <p>Also I have a custom long arrow.</p>
        </>
      }
      footer="And I should move up on small screens"
      placement="left"
      styles={{
        arrow: {
          base: 12,
          size: 64,
        },
      }}
      title="Oi, I have a title!"
    >
      <Button color="primary" size="sm">
        LEFT
      </Button>
    </Floater>
  );
}
