import Floater from 'react-floater';
import { Box, Button, Paragraph } from '@gilbarbara/components';

export default function WithHoverCustomDelay({ cb }: any) {
  return (
    <Box flex>
      <Floater
        callback={cb}
        content={
          <Paragraph size="large">
            I have an <b>eventDelay</b> prop for <i>hover</i> event that can be adjusted (move you
            mouse away)!
          </Paragraph>
        }
        event="hover"
        eventDelay={2.5}
        placement="top"
      >
        <Button size="sm">HOVER</Button>
      </Floater>
      <Paragraph mt="xs">2.5s delay</Paragraph>
    </Box>
  );
}
