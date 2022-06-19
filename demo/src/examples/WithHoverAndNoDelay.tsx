import Floater from 'react-floater';
import { Box, Button, Paragraph } from '@gilbarbara/components';

export default function WithHoverAndNoDelay({ cb }: any) {
  return (
    <Box flex>
      <Floater
        callback={cb}
        content={
          <Paragraph>I can be triggered by click or hover (on devices with a mouse)</Paragraph>
        }
        disableHoverToClick
        event="hover"
        eventDelay={0}
        placement="top"
        title="Events"
      >
        <Button size="sm">HOVER</Button>
      </Floater>
      <Paragraph mt="xs">no delay (0)</Paragraph>
    </Box>
  );
}
