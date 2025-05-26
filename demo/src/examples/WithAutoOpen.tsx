import Floater from 'react-floater';
import { Button } from '@heroui/react';

import Column from '../components/Column';

export default function AutoOpen({ cb }: any) {
  return (
    <Column>
      <Floater
        autoOpen
        callback={cb}
        content={
          <div>
            <p>React Floater is super easy to use and customize.</p>
            <p>
              It's powered by{' '}
              <a href="https://popper.js.org/" rel="noopener noreferrer" target="_blank">
                popper.js
              </a>{' '}
              to position the elements
            </p>
          </div>
        }
        placement="top"
      >
        <Button color="primary" size="sm">
          TOP
        </Button>
      </Floater>
      <p className="mt-2">autoOpen</p>
    </Column>
  );
}
