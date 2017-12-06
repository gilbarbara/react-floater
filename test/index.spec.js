import React from 'react';
import { mount } from 'enzyme';

import ReactTooltips from '../src';

const mockCallback = jest.fn();
const props = {
  callback: mockCallback,

};

function setup(ownProps = props) {
  return mount(
    <div style={{ margin: 30 }}>
      <ReactTooltips {...ownProps}>
        <a href="http://a.com">link</a>
      </ReactTooltips>
    </div>,
    { attachTo: document.getElementById('react') }
  );
}

describe('ReactTooltips', () => {
  const wrapper = setup();

  it('should mount', () => {
    console.log(wrapper.debug());
  });
});
