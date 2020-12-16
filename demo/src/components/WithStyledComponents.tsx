import React from 'react';
import Floater from 'react-floater';
import styled from 'styled-components';

const Wrapper = styled.div`
  background: linear-gradient(to bottom right, #9ec2ff 50%, #6ba2ff 50%, #6ba2ff 60%, #3882ff 60%);
  border-radius: 10px;
  max-width: 300px;
  padding: 3rem 2rem 2rem;
  text-align: right;
`;

const Button = styled.span`
  background-color: #000;
  color: #fff;
  display: inline-block;
  padding: 10px;
  border-radius: 4px;
`;

function CustomFloater({ closeFn, status }: any) {
  return (
    <Wrapper>
      <span aria-label="styled" role="img" style={{ fontSize: 60 }}>
        💅
      </span>
      <div>
        I'm a{' '}
        <a
          href="https://github.com/styled-components/styled-components"
          rel="noopener noreferrer"
          target="_blank"
        >
          <b>styled-component</b>
        </a>{' '}
        with the <strong>component</strong> and <strong>disableFlip</strong> props
      </div>
      <button onClick={closeFn} style={{ marginTop: 10 }} type="button">
        Close
      </button>
    </Wrapper>
  );
}

export default function WithStyledComponents({ cb }: any) {
  return (
    <div>
      <Floater
        callback={cb}
        component={CustomFloater}
        disableFlip
        placement="bottom-start"
        styles={{
          arrow: {
            color: '#9ec2ff',
          },
          floater: {
            filter: 'none',
          },
        }}
      >
        <Button>BOTTOM</Button>
      </Floater>
    </div>
  );
}
