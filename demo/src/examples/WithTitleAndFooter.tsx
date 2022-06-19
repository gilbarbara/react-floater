import Floater from 'react-floater';
import { Button, Paragraph } from '@gilbarbara/components';

export default function WithTitleAndFooter({ cb }: any) {
  return (
    <Floater
      callback={cb}
      content={
        <>
          <Paragraph>
            My content can be anything that can be rendered: numbers, strings, elements.
          </Paragraph>
          <Paragraph>Also I have a custom long arrow.</Paragraph>
        </>
      }
      footer="And I should move up on mobile"
      placement="left"
      styles={{
        arrow: {
          length: 64,
          spread: 12,
        },
      }}
      title="Oi, I have a title!"
    >
      <Button size="sm">LEFT</Button>
    </Floater>
  );
}
