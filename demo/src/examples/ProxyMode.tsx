import { useCallback, useRef } from 'react';
import Floater from 'react-floater';
import { Box } from '@gilbarbara/components';
import { useUpdate } from '@gilbarbara/hooks';

import Target from './Target';

export default function ProxyMode({ cb }: any) {
  const target = useRef<HTMLDivElement>(null);
  const update = useUpdate();

  const handleTargetMount = useCallback(() => {
    update();
  }, [update]);

  return (
    <Box flex>
      <Target ref={target} onMount={handleTargetMount} />
      {target.current && (
        <Floater
          callback={cb}
          content={
            <div>
              <p>Another instance is using me as a target for a new tooltip.</p>
              <p>
                Btw, I'm using the <b>auto</b> placement which can have unexpected behaviour. Be
                aware.{' '}
              </p>
              <p>
                <span aria-label="Emoji" role="img" style={{ fontSize: 42 }}>
                  😎
                </span>
              </p>
            </div>
          }
          event="hover"
          placement="auto"
          styles={{
            options: {
              zIndex: 1000,
            },
          }}
          target={target.current}
        >
          <span style={{ textDecoration: 'underline' }}>Proxy mode</span>
        </Floater>
      )}
    </Box>
  );
}
