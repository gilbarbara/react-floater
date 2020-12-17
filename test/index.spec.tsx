import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';

import ReactFloater from '../src';
import { Props, State } from '../src/types';

import Styled from './__fixtures__/Styled';
import { portalId } from '../src/utils';

jest.useFakeTimers();

const mockCallback = jest.fn();
const mockGetPopper = jest.fn(() => ({ instance: {} }));

const props: Props = {
  content: 'Hello! This is my content!',
  getPopper: mockGetPopper,
};

function setup(ownProps = props, children: React.ReactNode = 'Places'): ReactWrapper<Props, State> {
  return mount(<ReactFloater {...ownProps}>{children}</ReactFloater>);
}

describe('ReactFloater', () => {
  let portal: ReactWrapper;
  let floater: ReactWrapper<Props, State>;

  const unmount = () => {
    if (floater) {
      floater.unmount();
    }
  };

  const updateTooltip = (event: string | false = 'click') => {
    if (event) {
      floater.find('ReactFloaterWrapper').childAt(0).simulate(event);
      const delay = floater.prop('eventDelay') || 1;

      if (['click', 'mouseEnter'].includes(event)) {
        // @ts-ignore
        floater.instance().handleTransitionEnd(); // mock transitionend
      } else {
        setTimeout(() => {
          // @ts-ignore
          floater.instance().handleTransitionEnd();
        }, delay * 1100);
      }
    }

    floater.update();
    portal = floater.find('ReactFloaterPortal');
  };

  describe('basic usage', () => {
    beforeAll(() => {
      floater = setup();
      portal = floater.find('ReactFloaterPortal');
    });

    afterAll(unmount);

    it('should render properly', () => {
      expect(floater.find('ReactFloater')).toExist();
      expect(floater.find('ReactFloaterPortal').length).toBe(1);
      expect(floater.find('ReactFloaterWrapper span').at(0)).toHaveText('Places');
    });

    it('should have created a Portal', () => {
      expect(portal.find('.__floater')).toExist();
      expect(portal.find('.__floater__container')).toExist();
      expect(portal.find('.__floater__arrow')).toExist();
    });

    it('should have called getPopper', () => {
      // @ts-ignore
      const popper = mockGetPopper.mock.calls[0][0];

      // @ts-ignore
      expect(popper.instance.constructor.name).toBe('Popper');
    });

    it('should have rendered the Floater initially hidden', () => {
      const floaterEl = portal.find('.__floater');

      expect(floater.state('status')).toBe('idle');
      expect(floater.find('.__floater__container')).toHaveText('Hello! This is my content!');
      expect(floaterEl).toHaveStyle('opacity', 0);
      expect(floaterEl).toHaveStyle('visibility', 'hidden');
    });

    it('should be able to show the floater', () => {
      updateTooltip();
      const floaterEl = portal.find('.__floater');

      expect(floater.state('status')).toBe('open');
      expect(floaterEl).toHaveStyle('opacity', 1);
      expect(floaterEl).toHaveStyle('visibility', 'visible');
    });

    it('should be able to hide the floater', () => {
      updateTooltip();
      const floaterEl = portal.find('.__floater');

      expect(floater.state('status')).toBe('idle');
      expect(floaterEl).toHaveStyle('opacity', 0);
      expect(floaterEl).toHaveStyle('visibility', 'hidden');
    });

    it('should unmount properly', () => {
      floater.unmount();
      expect(floater.find('ReactFloater')).not.toExist();

      expect(floater.find('ReactFloaterPortal')).not.toExist();
    });
  });

  describe('with multiple children', () => {
    beforeAll(() => {
      floater = setup(props, [<div key={0}>Hello</div>, <div key={1}>World</div>]);
      portal = floater.find('ReactFloaterPortal');
    });

    afterAll(unmount);

    it('should render properly', () => {
      const content = floater.find('ReactFloaterWrapper').childAt(0).find('div');

      expect(floater.find('ReactFloater')).toExist();
      expect(floater.find('ReactFloaterPortal')).toExist();
      expect(content.at(0)).toHaveText('Hello');
      expect(content.at(1)).toHaveText('World');
    });
  });

  describe('with multiple instances', () => {
    const Component = () => {
      const [showTooltip, setTooltip] = React.useState(true);

      return (
        <React.Fragment>
          <p>
            The{' '}
            {showTooltip ? (
              <ReactFloater content="It was that bearded guy!">first president</ReactFloater>
            ) : (
              'first president'
            )}{' '}
            of the <ReactFloater content="You know what I mean">Republic of Bananas</ReactFloater>{' '}
            is dead.
          </p>
          <button onClick={() => setTooltip(s => !s)} type="button">
            Toggle
          </button>
        </React.Fragment>
      );
    };

    it('should render properly, add a single portal element and remove it after all tooltips unmount', () => {
      floater = mount(<Component />);

      expect(floater.html()).toMatchSnapshot();
      expect(document.getElementById('react-floater-portal')?.childElementCount).toBe(2);

      floater.find('button').simulate('click');
      expect(floater.html()).toMatchSnapshot();
      expect(document.getElementById('react-floater-portal')?.childElementCount).toBe(1);

      floater.unmount();

      expect(document.getElementById('react-floater-portal')).toBeNull();
    });
  });

  describe('with multiple instances and `portalElement`', () => {
    const element = document.createElement('div');
    element.id = 'tooltips';

    document.body.appendChild(element);

    afterAll(() => {
      document.body.removeChild(element);
    });

    const Component = () => {
      const [showTooltip, setTooltip] = React.useState(true);

      return (
        <React.Fragment>
          <p>
            The{' '}
            {showTooltip ? (
              <ReactFloater content="It was that bearded guy!" portalElement={element}>
                first president
              </ReactFloater>
            ) : (
              'first president'
            )}{' '}
            of the{' '}
            <ReactFloater content="You know what I mean" portalElement={element}>
              Republic of Bananas
            </ReactFloater>{' '}
            is dead.
          </p>
          <button onClick={() => setTooltip(s => !s)} type="button">
            Toggle
          </button>
        </React.Fragment>
      );
    };

    it("should render properly, use the `portalElement` and don't remove it afterwards", () => {
      const wrapper = mount(<Component />);

      expect(document.getElementById(portalId)).toBeNull();
      expect(wrapper.html()).toMatchSnapshot();
      expect(element.childElementCount).toBe(2);

      wrapper.find('button').simulate('click');
      expect(wrapper.html()).toMatchSnapshot();
      expect(element.childElementCount).toBe(1);

      wrapper.unmount();

      expect(element).not.toBeNull();
    });
  });

  describe('with `autoOpen`', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        autoOpen: true,
      });
    });

    afterAll(unmount);

    it('should have rendered the Floater initially open', () => {
      updateTooltip(false);
      const floaterEl = portal.find('.__floater');

      expect(floater.state('status')).toBe('open');
      expect(floaterEl).toHaveStyle('opacity', 1);
      expect(floaterEl).toHaveStyle('visibility', 'visible');
    });

    it('should be able to hide the floater', () => {
      updateTooltip();
      const floaterEl = portal.find('.__floater');

      expect(floater.state('status')).toBe('idle');
      expect(floaterEl).toHaveStyle('opacity', 0);
      expect(floaterEl).toHaveStyle('visibility', 'hidden');
    });

    it('should be able to show the floater again', () => {
      updateTooltip();
      const floaterEl = portal.find('.__floater');

      expect(floater.state('status')).toBe('open');
      expect(floaterEl).toHaveStyle('opacity', 1);
      expect(floaterEl).toHaveStyle('visibility', 'visible');
    });
  });

  describe('with `callback`', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        callback: mockCallback,
      });
    });

    afterAll(unmount);

    it('should call the callback function on open', () => {
      updateTooltip();

      expect(floater.state('status')).toBe('open');
      expect(mockCallback).toHaveBeenCalledWith('open', {
        autoOpen: false,
        callback: mockCallback,
        children: 'Places',
        content: 'Hello! This is my content!',
        debug: false,
        disableAnimation: false,
        disableFlip: false,
        disableHoverToClick: false,
        event: 'click',
        eventDelay: 0.4,
        getPopper: mockGetPopper,
        hideArrow: false,
        offset: 15,
        placement: 'bottom',
        showCloseButton: false,
        styles: {},
        target: null,
        wrapperOptions: { position: false },
      });
    });

    it('should call the callback function on close', () => {
      updateTooltip();
      expect(floater.state('status')).toBe('idle');

      expect(mockCallback).toHaveBeenCalledWith('close', {
        autoOpen: false,
        callback: mockCallback,
        children: 'Places',
        content: 'Hello! This is my content!',
        debug: false,
        disableAnimation: false,
        disableFlip: false,
        disableHoverToClick: false,
        event: 'click',
        eventDelay: 0.4,
        getPopper: mockGetPopper,
        hideArrow: false,
        offset: 15,
        placement: 'bottom',
        showCloseButton: false,
        styles: {},
        target: null,
        wrapperOptions: { position: false },
      });
    });
  });

  describe('with `event` hover', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        event: 'hover',
      });
    });

    afterAll(unmount);

    it('should be able to show the floater', () => {
      updateTooltip('mouseEnter');

      expect(floater.state('status')).toBe('open');
    });

    it('should still be open while the cursor is over it', () => {
      updateTooltip(false);

      expect(floater.state('status')).toBe('open');
    });

    it('should have close itself after `eventDelay`', () => {
      updateTooltip('mouseLeave');

      // @ts-ignore
      jest.advanceTimersByTime(floater.prop('eventDelay') * 1000); // trigger the close animation
      expect(floater.state('status')).toBe('closing');

      jest.advanceTimersByTime(400); // trigger the fake transitionend event
      expect(floater.state('status')).toBe('idle');
    });
  });

  describe('with `event` hover and `eventDelay` set to 0', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        event: 'hover',
        eventDelay: 0,
      });
    });

    afterAll(unmount);

    it('should be able to show the floater', () => {
      updateTooltip('mouseEnter');

      expect(floater.state('status')).toBe('open');
    });

    it('should have close itself immediately', () => {
      updateTooltip('mouseLeave');

      expect(floater.state('status')).toBe('idle');

      jest.advanceTimersByTime(0); // trigger the fake transitionend event

      expect(floater.state('status')).toBe('idle');
    });
  });

  describe('with `title`', () => {
    beforeAll(() => {
      const Title = () => <h3>My Title</h3>;
      floater = setup({
        ...props,
        title: <Title />,
      });
    });

    afterAll(unmount);

    it('should have rendered the title', () => {
      expect(floater.find('Title')).toExist();

      floater.setProps({
        title: <div className="__title">Other Title</div>,
      });

      expect(floater.find('Title')).not.toExist();
      expect(floater.find('.__title')).toExist();
    });
  });

  describe('with `footer`', () => {
    beforeAll(() => {
      const Footer = () => (
        <footer>
          <button type="button">NEXT</button>
        </footer>
      );
      floater = setup({
        ...props,
        footer: <Footer />,
      });
    });

    afterAll(unmount);

    it('should have rendered the footer', () => {
      expect(floater.find('Footer')).toExist();

      floater.setProps({
        footer: <div className="__footer">Hello</div>,
      });

      expect(floater.find('Footer')).not.toExist();
      expect(floater.find('.__footer')).toExist();
    });
  });

  describe('with `portalElement`', () => {
    const element = document.createElement('div');
    element.id = 'tooltips';

    document.body.appendChild(element);

    afterAll(() => {
      document.body.removeChild(element);
      unmount();
    });

    it('should should render properly and use the `portalElement`', () => {
      floater = setup({
        ...props,
        portalElement: element,
      });

      expect(floater.html()).toMatchSnapshot();
      expect(element.childElementCount).toBe(1);
      expect(document.getElementById(portalId)).toBeNull();

      floater.unmount();

      expect(element.childElementCount).toBe(0);
      expect(element).not.toBeNull();
    });
  });

  describe('with `open`', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        open: false,
      });
    });

    afterAll(unmount);

    it('should not be able to show the floater with click', () => {
      updateTooltip('click');

      expect(floater.state('status')).toBe('idle');
    });

    it('should not be able to show the floater with hover', () => {
      floater.setProps({ event: 'hover' });
      updateTooltip('mouseEnter');

      expect(floater.state('status')).toBe('idle');
    });

    it('should show the floater when `open` is true', () => {
      floater.setProps({ open: true });
      expect(floater.state('status')).toBe('opening');

      // @ts-ignore
      floater.instance().handleTransitionEnd();
      expect(floater.state('status')).toBe('open');
    });

    it('should close the floater when `open` is false', () => {
      floater.setProps({ open: false });
      expect(floater.state('status')).toBe('closing');

      // @ts-ignore
      floater.instance().handleTransitionEnd();
      expect(floater.state('status')).toBe('idle');
    });
  });

  describe('with `placement` top', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        placement: 'top',
      });
    });

    afterAll(unmount);

    it('should use `placement` top', () => {
      // @ts-ignore
      expect(floater.instance().popper.originalPlacement).toBe('top');
      expect(floater.state('currentPlacement')).toBe('top');
    });
  });

  describe('with `placement` center', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        placement: 'center',
      });
    });

    afterAll(unmount);

    it('should use `placement` center', () => {
      // @ts-ignore
      expect(floater.instance().popper).not.toBeDefined();
      expect(floater.state('currentPlacement')).toBe('center');
    });

    it('should have skipped the arrow', () => {
      updateTooltip();

      const floaterEl = portal.find('.__floater');

      expect(floater.state('status')).toBe('open');
      expect(floaterEl.find('.__floater__arrow')).not.toExist();
    });
  });

  describe('with `component` as function', () => {
    beforeAll(() => {
      floater = setup({
        component: Styled,
      });
    });

    afterAll(unmount);

    it('should show the floater with click', () => {
      updateTooltip('click');

      expect(floater.state('status')).toBe('open');
    });

    it('should have rendered the component', () => {
      expect(floater.find('.__floater__body').html()).toMatchSnapshot();
    });

    it('should be able to close the floater with `closeFn` prop', () => {
      floater.find('.__floater__body button').simulate('click');

      expect(floater.state('status')).toBe('closing');
    });
  });

  describe('with `component` as element', () => {
    beforeAll(() => {
      floater = setup({
        component: <Styled />,
        styles: {
          options: {
            zIndex: 1000,
          },
        },
      });
    });

    afterAll(unmount);

    it('should show the floater with click', () => {
      updateTooltip('click');

      expect(floater.state('status')).toBe('open');
    });

    it('should have rendered the component', () => {
      expect(floater.find('.__floater__body').html()).toMatchSnapshot();
    });

    it('should be able to close the floater with `closeFn` prop', () => {
      floater.find('.__floater__body button').simulate('click');

      expect(floater.state('status')).toBe('closing');
    });
  });

  describe('with `showCloseButton`', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        showCloseButton: true,
      });
    });

    afterAll(unmount);

    it('should show the floater with click', () => {
      updateTooltip('click');

      expect(floater.state('status')).toBe('open');
    });

    it('should have a close button', () => {
      expect(floater.find('FloaterCloseBtn')).toExist();
    });

    it('should be able to close the floater clicking the close button', () => {
      floater.find('FloaterCloseBtn').simulate('click');

      expect(floater.state('status')).toBe('closing');
    });
  });
});
