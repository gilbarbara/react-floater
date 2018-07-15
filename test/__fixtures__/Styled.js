import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: #cce8ff;
`;

const Styled = ({ closeFn }) => (
  <Wrapper>
    <div>Styled</div>
    <button onClick={closeFn} type="button">close</button>
  </Wrapper>
);

export default Styled;
