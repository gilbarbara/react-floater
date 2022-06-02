import * as React from 'react';
import styled from '@emotion/styled';

import ReactFloater from '../../src';
import { Props } from '../../src/types';

export function Floaters(props: Omit<Props, 'content' | 'component'>) {
  const [showTooltip, setTooltip] = React.useState(true);

  return (
    <>
      <p>
        The{' '}
        {showTooltip ? (
          <ReactFloater content="It was that bearded guy!" id="president" {...props}>
            first president
          </ReactFloater>
        ) : (
          'first president'
        )}{' '}
        of the{' '}
        <ReactFloater content="You know what I mean" id="republic" {...props}>
          Republic of Bananas
        </ReactFloater>{' '}
        is dead.
      </p>
      <button onClick={() => setTooltip(s => !s)} type="button">
        Toggle
      </button>
    </>
  );
}

export function Button({ innerRef, ...props }: any) {
  return (
    <button ref={innerRef} {...props} type="button">
      Click me
    </button>
  );
}

const Wrapper = styled.div`
  background-color: #cce8ff;
`;

export function Styled({ closeFn }: any) {
  return (
    <Wrapper>
      <div>Styled</div>
      <button onClick={closeFn} type="button">
        close
      </button>
    </Wrapper>
  );
}
