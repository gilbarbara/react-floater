import React from 'react';
import { mount } from 'enzyme';

import ReactFloater from '../src/index';

import Styled from './__fixtures__/Styled';

jest.useFakeTimers();

const mockCallback = jest.fn();
const mockGetPopper = jest.fn();

const props = {
  content: 'Hello! This is my content!',
  getPopper: mockGetPopper,
};

function setup(ownProps = props, children = 'Places') {
  return mount(<ReactFloater {...ownProps}>{children}</ReactFloater>, {
    attachTo: document.getElementById('react'),
  });
}

describe('ReactFloater', () => {
  let portal;
  let floater;

  const updateTooltip = (event = 'click') => {
    if (event) {
      floater
        .find('ReactFloaterWrapper')
        .childAt(0)
        .simulate(event);

      if (['click', 'mouseEnter'].includes(event)) {
        floater.instance().handleTransitionEnd(); // mock transitionend
      } else {
        setTimeout(() => {
          floater.instance().handleTransitionEnd();
        }, floater.prop('eventDelay') * 1100);
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
      const popper = mockGetPopper.mock.calls[0][0];

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

    it('should render properly', () => {
      const content = floater
        .find('ReactFloaterWrapper')
        .childAt(0)
        .find('div');

      expect(floater.find('ReactFloater')).toExist();
      expect(floater.find('ReactFloaterPortal')).toExist();
      expect(content.at(0)).toHaveText('Hello');
      expect(content.at(1)).toHaveText('World');
    });
  });

  describe('with `autoOpen`', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        autoOpen: true,
      });
    });

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

    it('should have rendered the footer', () => {
      expect(floater.find('Footer')).toExist();

      floater.setProps({
        footer: <div className="__footer">Hello</div>,
      });

      expect(floater.find('Footer')).not.toExist();
      expect(floater.find('.__footer')).toExist();
    });
  });

  describe('with `id`', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        id: 'hello-world',
      });
    });

    it('should have added the id to the portal floater', () => {
      const namedPortal = document.getElementById('hello-world');

      expect(namedPortal).toBeInstanceOf(HTMLDivElement);
      expect(namedPortal.querySelector('.__floater')).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('with `open`', () => {
    beforeAll(() => {
      floater = setup({
        ...props,
        open: false,
      });
    });

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

      floater.instance().handleTransitionEnd();
      expect(floater.state('status')).toBe('open');
    });

    it('should close the floater when `open` is false', () => {
      floater.setProps({ open: false });
      expect(floater.state('status')).toBe('closing');

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

    it('should use `placement` top', () => {
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

    it('should use `placement` center', () => {
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

    it('should show the floater with click', () => {
      updateTooltip('click');

      expect(floater.state('status')).toBe('open');
    });

    it('should have rendered the component', () => {
      expect(floater.find('.__floater__body')).toMatchSnapshot();
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

    it('should show the floater with click', () => {
      updateTooltip('click');

      expect(floater.state('status')).toBe('open');
    });

    it('should have rendered the component', () => {
      expect(floater.find('.__floater__body')).toMatchSnapshot();
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
