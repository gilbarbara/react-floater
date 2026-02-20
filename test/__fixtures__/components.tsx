import { useEffect, useState } from 'react';
import styled from '@emotion/styled';

import ReactFloater from '../../src';
import { Props } from '../../src/types';

export function Button({ innerRef, ...props }: any) {
  return (
    <button ref={innerRef} id="button" {...props} type="button">
      Click me
    </button>
  );
}

export function Floaters(props: Omit<Props, 'content' | 'component'>) {
  const [showTooltip, setTooltip] = useState(true);

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

export function InlineComponentWrapper({
  initialOpen = true,
  onMount,
  ...floaterProps
}: Omit<Props, 'content' | 'component'> & { initialOpen?: boolean; onMount: () => void }) {
  // Mimics consumers like react-joyride that store refs in state, triggering re-renders
  const [, setElement] = useState<HTMLElement | null>(null);
  const [popper, setPopper] = useState<any>(null);

  return (
    <ReactFloater
      {...floaterProps}
      // eslint-disable-next-line react/no-unstable-nested-components
      component={() => (
        <div ref={setElement}>
          <MountTracker onMount={onMount} />
        </div>
      )}
      getPopper={(instance, type) => {
        if (type === 'floater' && !popper) {
          setPopper(instance);
        }
      }}
      open={initialOpen}
    >
      <button type="button">target</button>
    </ReactFloater>
  );
}

export function MountTracker({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div>tracked</div>;
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
