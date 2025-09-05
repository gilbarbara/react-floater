import Floater, { CustomComponentProps } from 'react-floater';
import styled from '@emotion/styled';
import { Button } from '@gilbarbara/components';

import Column from '../components/Column';

const Wrapper = styled.div`
  background: linear-gradient(to bottom right, #9ec2ff 50%, #6ba2ff 50%, #6ba2ff 60%, #3882ff 60%);
  border-radius: 10px;
  max-width: 300px;
  padding: 3rem 2rem 2rem;
  text-align: right;
`;

function CustomFloater({ closeFn }: CustomComponentProps) {
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
      <Button bg="white" onClick={closeFn} size="sm" style={{ marginTop: 10 }}>
        Close
      </Button>
    </Wrapper>
  );
}

export default function WithStyledComponents({ cb }: any) {
  return (
    <Column>
      <Floater
        arrow={
          <svg
            height="100px"
            transform="rotate(180)"
            version="1.1"
            viewBox="0 0 10 100"
            width="10px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M5.19249228e-07,5.16768813 C0.000571745188,2.3180242 2.3238984,6.52762368e-06 5.17356233,6.52762368e-06 C7.4961469,-0.00369898343 9.46628897,1.57062447 10.1275925,3.67813093 C11.5918888,8.26905035 5.18127186,100.000007 5.18127186,100.000007 L1.9635443,41.3615605 C0.907405183,22.0686414 -0.000792731847,5.40502691 5.19249228e-07,5.16768813 Z M5.18507488,2.58554059 C3.75638551,2.5874823 2.59249512,3.74291582 2.59443184,5.17160518 C2.59160462,6.52075954 3.7928988,13.3574741 4.95859452,14.5045202 C6.56709198,13.5758538 7.69207267,4.78979882 7.69207267,4.78979882 C7.50203478,3.55199808 6.48229278,2.58749911 5.18507488,2.58554059 Z"
                fill="currentColor"
              />
            </g>
          </svg>
        }
        callback={cb}
        component={CustomFloater}
        disableFlip
        placement="bottom-start"
        portalElement="#portalElement"
        styles={{
          arrow: {
            base: 10,
            color: '#6ba2ff',
            size: 80,
          },
        }}
      >
        <Button size="sm">BOTTOM</Button>
      </Floater>
    </Column>
  );
}
