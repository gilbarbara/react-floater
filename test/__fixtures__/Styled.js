import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: #cce8ff;
`;

const Styled = ({ closeTooltip }) => (
  <Wrapper>
    <div>Styled</div>
    <button onClick={closeTooltip}>close</button>
  </Wrapper>
);

export default Styled;
