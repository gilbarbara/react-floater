import React, { useCallback, useRef } from 'react';
import Floater from 'react-floater';
import { useUpdate } from 'react-use';

import Target from './Target';

export default function ProxyMode({ cb }: any) {
  const target = useRef<HTMLDivElement>(null);
  const update = useUpdate();

  const handleTargetMount = useCallback(() => {
    update();
  }, [update]);

  return (
    <div>
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
          style={{ marginTop: 20 }}
          target={target.current}
        >
          <span style={{ textDecoration: 'underline' }}>Proxy mode</span>
        </Floater>
      )}
    </div>
  );
}
