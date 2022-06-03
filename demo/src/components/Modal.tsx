import React from 'react';
import Floater from 'react-floater';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  padding: 2rem;
  background: linear-gradient(to bottom, #ccc 30%, #fff);
  border-radius: 10px;
  position: relative;
  width: 90vw;
  height: 90vh;
`;

const Title = styled.h2`
  margin-bottom: 30px;
`;

const Button = styled.button`
  background: transparent;
  color: palevioletred;
  padding: 8px;
  position: absolute;
  top: 15px;
  right: 15px;
  width: auto;
`;

const Group = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  color: palevioletred;
  display: block;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  border-radius: 3px;
  border: 2px solid palevioletred;
  color: palevioletred;
  display: block;
  font-size: 20px;
  line-height: 1;
  max-width: 500px;
  padding: 10px;
  width: 100%;
`;

Input.defaultProps = {
  required: true,
};

function Content({ closeFn }: any) {
  return (
    <Wrapper>
      <Title>I'm a custom component acting as modal. No arrow and centered</Title>
      <Button onClick={closeFn}>✖</Button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          closeFn();
        }}
      >
        <Group>
          <Label>Name</Label>
          <Input />
        </Group>
        <Group>
          <Label>Address</Label>
          <Input />
        </Group>

        <button type="submit">SEND</button>
      </form>
    </Wrapper>
  );
}

export default function Modal({ cb }: any) {
  return (
    <div>
      <Floater callback={cb} component={Content} hideArrow placement="center">
        <button type="button">MODAL</button>
      </Floater>
    </div>
  );
}
