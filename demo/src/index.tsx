import React from 'react';
import ReactDOM from 'react-dom';
import disableScroll from 'disable-scroll';

import Badges from './components/Badges';

import BeaconMode from './components/BeaconMode';
import ControlledMode from './components/ControlledMode';
import Modal from './components/Modal';
import ProxyMode from './components/ProxyMode';
import WithAutoOpen from './components/WithAutoOpen';
import WithCustomStyles from './components/WithCustomStyles';
import WithHoverCustomDelay from './components/WithHoverCustomDelay';
import WithHoverAndNoDelay from './components/WithHoverAndNoDelay';
import WithHoverDefault from './components/WithHoverDefault';
import WithOverlay from './components/WithOverlay';
import WithPosition from './components/WithPosition';
import WithStyledComponents from './components/WithStyledComponents';
import WithText from './components/WithText';
import WithTitleAndFooter from './components/WithTitleAndFooter';

import './index.css';

const { env } = process;
env.PUBLIC_URL = env.PUBLIC_URL || '';

function App() {
  const cb = (action: any, data: any) => {
    console.log(action, data);

    if (data.placement === 'center') {
      disableScroll[action === 'open' ? 'on' : 'off']();
    }
  };

  return (
    <div className="App">
      <div className="App-hero">
        <h1>react-floater</h1>
        <h2>A component to create awesome tooltips, modals and more!</h2>
        {window.innerWidth >= 768 && <WithPosition cb={cb} />}
      </div>
      <div className="App-clicks">
        <h2>The classic examples</h2>

        <div className="App-content">
          <WithAutoOpen cb={cb} />
          <div className="App-flex" style={{ marginTop: '3rem' }}>
            <WithTitleAndFooter cb={cb} />
            <WithCustomStyles cb={cb} />
          </div>
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <WithStyledComponents cb={cb} />
          </div>
        </div>
      </div>
      <div className="App-hover">
        <h2>Hover</h2>
        <small>
          It will switch to click on mobile.
          <br />
          (can be disabled with <b>disableHoverToClick</b> prop)
        </small>
        <div className="App-content App-flex">
          <WithHoverDefault cb={cb} />
          <WithHoverCustomDelay cb={cb} />
          <WithHoverAndNoDelay cb={cb} />
        </div>
      </div>
      <div className="App-text">
        <h2>Inside text</h2>
        <WithText cb={cb} />
      </div>
      <div className="App-overlay">
        <h2>with Overlay</h2>
        <div className="App-content">
          <WithOverlay cb={cb} />
        </div>
      </div>
      <div className="App-target">
        <h2>Custom targets</h2>
        <div className="App-content">
          <ProxyMode cb={cb} />
          <BeaconMode cb={cb} />
          <ControlledMode cb={cb} />
          <Modal cb={cb} />
        </div>
      </div>
      {process.env.NODE_ENV === 'production' && <Badges />}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
