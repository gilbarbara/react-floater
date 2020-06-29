import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: #cce8ff;
`;

const Styled = ({ closeFn, status }) => (
  <Wrapper>
    <div>Styled</div>
    <input type="hidden" value={status || ''} name="status" />
    <button onClick={closeFn} type="button">
      close
    </button>
  </Wrapper>
);

export default Styled;
