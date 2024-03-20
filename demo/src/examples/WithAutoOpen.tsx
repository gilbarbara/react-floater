import Floater from 'react-floater';
import { Box, Button, Paragraph } from '@gilbarbara/components';

import Column from '../components/Column';

export default function AutoOpen({ cb }: any) {
  return (
    <Column>
      <Floater
        autoOpen
        callback={cb}
        content={
          <Box>
            <Paragraph>React Floater is super easy to use and customize.</Paragraph>
            <Paragraph>
              It's powered by{' '}
              <a href="https://popper.js.org/" rel="noopener noreferrer" target="_blank">
                popper.js
              </a>{' '}
              to position the elements
            </Paragraph>
          </Box>
        }
        placement="top"
      >
        <Button size="sm">TOP</Button>
      </Floater>
      <Paragraph mt="xxs">autoOpen</Paragraph>
    </Column>
  );
}
