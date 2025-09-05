import Floater from 'react-floater';
import { Button, H3, Paragraph } from '@gilbarbara/components';

export default function WithCustomStyles({ cb }: any) {
  return (
    <Floater
      callback={cb}
      content={
        <Paragraph>
          You can change the UI completely. Also control placement, offset, flip and much more.
        </Paragraph>
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
        <H3>
          I'm super customizable{' '}
          <span aria-label="Smile with Sunglasses" role="img">
            😎
          </span>
        </H3>
      }
    >
      <Button size="sm">RIGHT</Button>
    </Floater>
  );
}
