import Floater from 'react-floater';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Box, Paragraph } from '@gilbarbara/components';

const { PUBLIC_URL = '' } = process.env;

const BeaconFlick = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
`;

const Beacon = styled.span`
  animation: ${BeaconFlick} 1s infinite;
  display: inline-block;
  border-radius: 50%;
  border: 3px solid #0044ff;
  padding: 4px;

  &:before {
    background-color: #0044ff;
    border-radius: 50%;
    content: '';
    display: block;
    height: 20px;
    width: 20px;
  }
`;

export default function BeaconMode({ cb }: any) {
  return (
    <Box flex>
      <img
        alt="Microsoft Popup"
        className="old-tooltip"
        height="200"
        src={`${PUBLIC_URL}/windows-popup.png`}
        width="320"
      />
      <Floater
        callback={cb}
        content={<Paragraph size="lg">Yeah, this is how we use to look back in the day!</Paragraph>}
        disableFlip
        event="hover"
        placement="top"
        target=".old-tooltip"
        wrapperOptions={{
          offset: -20,
          placement: 'bottom',
          position: true,
        }}
      >
        <Beacon />
      </Floater>
      <Paragraph mt="md">Beacon mode</Paragraph>
    </Box>
  );
}
