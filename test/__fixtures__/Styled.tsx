import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: #cce8ff;
`;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Styled({ closeFn }: any) {
  return (
    <Wrapper>
      <div>Styled</div>
      <button onClick={closeFn} type="button">
        close
      </button>
    </Wrapper>
  );
}
