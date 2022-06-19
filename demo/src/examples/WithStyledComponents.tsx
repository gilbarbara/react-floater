import Floater from 'react-floater';
import styled from '@emotion/styled';
import { Button } from '@gilbarbara/components';

const Wrapper = styled.div`
  background: linear-gradient(to bottom right, #9ec2ff 50%, #6ba2ff 50%, #6ba2ff 60%, #3882ff 60%);
  border-radius: 10px;
  max-width: 300px;
  padding: 3rem 2rem 2rem;
  text-align: right;
`;

function CustomFloater({ closeFn }: any) {
  return (
    <Wrapper>
      <span aria-label="styled" role="img" style={{ fontSize: 60 }}>
        💅
      </span>
      <div>
        I'm a floater with a custom component using{' '}
        <a href="https://emotion.sh/docs/introduction" rel="noopener noreferrer" target="_blank">
          <b>emotion</b>
        </a>{' '}
        and <strong>bottom-start</strong> placement.
      </div>
      <Button onClick={closeFn} size="sm" style={{ marginTop: 10 }} variant="white">
        Close
      </Button>
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
        }}
      >
        <Button size="sm">BOTTOM</Button>
      </Floater>
    </div>
  );
}
