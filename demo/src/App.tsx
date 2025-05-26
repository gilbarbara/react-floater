import { useUnmount } from '@gilbarbara/hooks';
import disableScroll from 'disable-scroll';

import Block from './components/Block';
import Content from './components/Content';
import GitHubRepo from './components/GitHubRepo';
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
    <div>
      <GitHubRepo />
      <div className="flex flex-col items-center justify-center min-h-64 px-16">
        <h1 className="text-4xl font-bold mb-4">react-floater</h1>
        <p className="font-bold">A component to create awesome tooltips, modals and more!</p>
        {window.innerWidth >= 768 && <WithPosition cb={callback} />}
      </div>
      <Block gray>
        <h2 className="text-2xl font-bold mb-8">The classic examples</h2>

        <div className="flex flex-col gap-8 w-full">
          <WithAutoOpen cb={callback} />
          <div className="flex justify-between max-w-lg mx-auto w-full">
            <WithTitleAndFooter cb={callback} />
            <WithCustomStyles cb={callback} />
          </div>
          <WithStyledComponents cb={callback} />
        </div>
      </Block>
      <Block>
        <h2 className="text-2xl font-bold">Hover</h2>
        <p className="text-foreground-500 text-center">
          It will switch to click on mobile.
          <br />
          (can be disabled with <b>disableHoverToClick</b> prop)
        </p>

        <div className="flex flex-col gap-4 mt-8">
          <WithHoverDefault cb={callback} />
          <WithHoverCustomDelay cb={callback} />
          <WithHoverAndNoDelay cb={callback} />
        </div>
      </Block>
      <Block gray>
        <h2 className="text-2xl font-bold mb-8">Inside text</h2>
        <WithText cb={callback} />
      </Block>
      <Block>
        <h2 className="text-2xl font-bold mb-8">With Overlay</h2>
        <WithOverlay cb={callback} />
      </Block>
      <Block gray>
        <h2 className="text-2xl font-bold mb-8">Custom targets</h2>
        <Content className="max-w-2xl mb-8">
          <ProxyMode cb={callback} />
          <BeaconMode cb={callback} />
        </Content>
        <Content className="max-w-2xl">
          <ControlledMode cb={callback} />
          <Modal cb={callback} />
        </Content>
      </Block>
      <div id="portalElement" />
    </div>
  );
}
