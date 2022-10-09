import { useUnmount } from 'react-use';
import { Box, BoxCenter, H1, H2, Paragraph } from '@gilbarbara/components';
import disableScroll from 'disable-scroll';

import Block from './components/Block';
import Content from './components/Content';
import GlobalStyles from './components/GlobalStyles';
import Badges from './examples/Badges';
import BeaconMode from './examples/BeaconMode';
import ControlledMode from './examples/ControlledMode';
import Modal from './examples/Modal';
import ProxyMode from './examples/ProxyMode';
import WithAutoOpen from './examples/WithAutoOpen';
import WithCustomStyles from './examples/WithCustomStyles';
import WithHoverAndNoDelay from './examples/WithHoverAndNoDelay';
import WithHoverCustomDelay from './examples/WithHoverCustomDelay';
import WithHoverDefault from './examples/WithHoverDefault';
import WithOverlay from './examples/WithOverlay';
import WithPosition from './examples/WithPosition';
import WithStyledComponents from './examples/WithStyledComponents';
import WithText from './examples/WithText';
import WithTitleAndFooter from './examples/WithTitleAndFooter';

const { NODE_ENV } = process.env;

function callback(action: any, data: any) {
  // eslint-disable-next-line no-console
  console.log(action, data);

  if (data.placement === 'center') {
    disableScroll[action === 'open' ? 'on' : 'off']();
  }
}

export default function App() {
  useUnmount(() => {
    disableScroll.off();
  });

  return (
    <Box>
      <GlobalStyles />
      <BoxCenter minHeight={256} px="xl" textAlign="center">
        <H1>react-floater</H1>
        <Paragraph bold>A component to create awesome tooltips, modals and more!</Paragraph>
        {window.innerWidth >= 768 && <WithPosition cb={callback} />}
      </BoxCenter>
      <Block gray>
        <H2 mb="xxl">The classic examples</H2>

        <Content>
          <WithAutoOpen cb={callback} />
          <Content my="xl" spaced>
            <WithTitleAndFooter cb={callback} />
            <WithCustomStyles cb={callback} />
          </Content>
          <BoxCenter>
            <WithStyledComponents cb={callback} />
          </BoxCenter>
        </Content>
      </Block>
      <Block>
        <H2>Hover</H2>
        <Paragraph color="gray" size="mid">
          It will switch to click on mobile.
          <br />
          (can be disabled with <b>disableHoverToClick</b> prop)
        </Paragraph>

        <Content mt="xxxl" spaced>
          <WithHoverDefault cb={callback} />
          <WithHoverCustomDelay cb={callback} />
          <WithHoverAndNoDelay cb={callback} />
        </Content>
      </Block>
      <Block gray>
        <H2 mb="xxl">Inside text</H2>
        <WithText cb={callback} />
      </Block>
      <Block>
        <H2 mb="xxl">With Overlay</H2>
        <WithOverlay cb={callback} />
      </Block>
      <Block gray>
        <H2 mb="xxl">Custom targets</H2>
        <Content maxWidth={640} mb="xxl" spaced>
          <ProxyMode cb={callback} />
          <BeaconMode cb={callback} />
        </Content>
        <Content maxWidth={640} spaced>
          <ControlledMode cb={callback} />
          <Modal cb={callback} />
        </Content>
      </Block>
      <div id="portalElement" />
      {NODE_ENV === 'production' && <Badges />}
    </Box>
  );
}
