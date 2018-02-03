import React from 'react';
import { mount } from 'enzyme';

import ReactTooltips from '../src';

jest.useFakeTimers();

const mockCallback = jest.fn();
const props = {
  content: 'Hello! This is my content!',
};

function setup(ownProps = props) {
  return mount(
    <ReactTooltips {...ownProps}>
      Places
    </ReactTooltips>,
    { attachTo: document.getElementById('react') }
  );
}

describe('ReactTooltips', () => {
  let portal;
  let wrapper;

  const updateTooltip = (event = 'click') => {
    if (event) {
      wrapper.find('Tooltip').childAt(0).simulate(event);

      if (['click', 'mouseEnter'].includes(event)) {
        wrapper.instance().handleTransitionEnd(); // mock transitionend
      }
      else {
        setTimeout(() => {
          wrapper.instance().handleTransitionEnd();
        }, wrapper.prop('eventDelay') * 1100);
      }
    }

    wrapper.update();
    portal = mount(wrapper.find('Tooltip').get(0));
  };

  describe('basic usage', () => {
    beforeAll(() => {
      wrapper = setup();
      portal = mount(wrapper.find('Tooltip').get(0));
    });

    afterAll(() => {
      wrapper.detach();
    });

    it('should render properly', () => {
      expect(wrapper.find('ReactTooltips')).toBePresent();
      expect(wrapper.find('Tooltip')).toBePresent();
      expect(wrapper.find('span').at(0)).toHaveText('Places');
    });

    it('should have created a Portal', () => {
      expect(portal.find('.__tooltip')).toBePresent();
      expect(portal.find('.__tooltip__container')).toBePresent();
      expect(portal.find('.__tooltip__arrow')).toBePresent();
    });

    it('should have rendered the Tooltip initially hidden', () => {
      const tooltip = portal.find('.__tooltip');

      expect(wrapper.state('status')).toBe('idle');
      expect(tooltip.find('.__tooltip__container')).toHaveText('Hello! This is my content!');
      expect(tooltip).toHaveStyle('opacity', 0);
      expect(tooltip).toHaveStyle('visibility', 'hidden');
    });

    it('should be able to show the tooltip', () => {
      updateTooltip();
      const tooltip = portal.find('.__tooltip');

      expect(wrapper.state('status')).toBe('open');
      expect(tooltip).toHaveStyle('opacity', 1);
      expect(tooltip).toHaveStyle('visibility', 'visible');
    });

    it('should be able to hide the tooltip', () => {
      updateTooltip();
      const tooltip = portal.find('.__tooltip');

      expect(wrapper.state('status')).toBe('idle');
      expect(tooltip).toHaveStyle('opacity', 0);
      expect(tooltip).toHaveStyle('visibility', 'hidden');
    });

    it('should unmount properly', () => {
      wrapper.unmount();
      expect(wrapper.find('ReactTooltips')).not.toBePresent();

      portal.unmount();
      expect(portal.find('Tooltip')).not.toBePresent();
    });
  });

  describe('with `autoOpen`', () => {
    beforeAll(() => {
      wrapper = setup({
        ...props,
        autoOpen: true,
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should have rendered the Tooltip initially open', () => {
      updateTooltip(false);
      const tooltip = portal.find('.__tooltip');

      expect(wrapper.state('status')).toBe('open');
      expect(tooltip).toHaveStyle('opacity', 1);
      expect(tooltip).toHaveStyle('visibility', 'visible');
    });

    it('should be able to hide the tooltip', () => {
      updateTooltip();
      const tooltip = portal.find('.__tooltip');

      expect(wrapper.state('status')).toBe('idle');
      expect(tooltip).toHaveStyle('opacity', 0);
      expect(tooltip).toHaveStyle('visibility', 'hidden');
    });

    it('should be able to show the tooltip again', () => {
      updateTooltip();
      const tooltip = portal.find('.__tooltip');

      expect(wrapper.state('status')).toBe('open');
      expect(tooltip).toHaveStyle('opacity', 1);
      expect(tooltip).toHaveStyle('visibility', 'visible');
    });
  });

  describe('with `callback`', () => {
    beforeAll(() => {
      wrapper = setup({
        ...props,
        callback: mockCallback,
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should call the callback function on open', () => {
      updateTooltip();

      expect(wrapper.state('status')).toBe('open');
      expect(mockCallback).toHaveBeenCalledWith('open', {
        animate: true,
        autoOpen: false,
        callback: mockCallback,
        children: 'Places',
        content: 'Hello! This is my content!',
        event: 'click',
        eventDelay: 0.4,
        flip: true,
        offset: 15,
        placement: 'bottom',
        showCloseButton: false,
        styles: {},
        target: null,
        wrapperOptions: { position: false }
      });
    });

    it('should call the callback function on close', () => {
      updateTooltip();
      expect(wrapper.state('status')).toBe('idle');

      expect(mockCallback).toHaveBeenCalledWith('close', {
        animate: true,
        autoOpen: false,
        callback: mockCallback,
        children: 'Places',
        content: 'Hello! This is my content!',
        event: 'click',
        eventDelay: 0.4,
        flip: true,
        offset: 15,
        placement: 'bottom',
        showCloseButton: false,
        styles: {},
        target: null,
        wrapperOptions: { position: false }
      });
    });
  });

  describe('with `event` hover', () => {
    beforeAll(() => {
      wrapper = setup({
        ...props,
        event: 'hover',
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should be able to show the tooltip', () => {
      updateTooltip('mouseEnter');

      expect(wrapper.state('status')).toBe('open');
    });

    it('should still be open while the cursor is over it', () => {
      updateTooltip(false);

      expect(wrapper.state('status')).toBe('open');
    });

    it('should have close itself after `eventDelay`', () => {
      updateTooltip('mouseLeave');

      jest.advanceTimersByTime(wrapper.prop('eventDelay') * 1000); // trigger the close animation
      expect(wrapper.state('status')).toBe('closing');

      jest.advanceTimersByTime(400); // trigger the fake transitionend event
      expect(wrapper.state('status')).toBe('idle');
    });
  });

  describe('with `event` hover and `eventDelay` set to 0', () => {
    beforeAll(() => {
      wrapper = setup({
        ...props,
        event: 'hover',
        eventDelay: 0,
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should be able to show the tooltip', () => {
      updateTooltip('mouseEnter');

      expect(wrapper.state('status')).toBe('open');
    });

    it('should have close itself immediately', () => {
      updateTooltip('mouseLeave');

      expect(wrapper.state('status')).toBe('idle');

      jest.advanceTimersByTime(0); // trigger the fake transitionend event

      expect(wrapper.state('status')).toBe('idle');
    });
  });

  describe('with `footer`', () => {
    beforeAll(() => {
      const Footer = () => (
        <footer>
          <button>NEXT</button>
        </footer>
      );
      wrapper = setup({
        ...props,
        footer: (<Footer />),
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should have rendered the footer', () => {
      expect(wrapper.find('Footer')).toBePresent();

      wrapper.setProps({
        footer: (<div className="__footer">Hello</div>)
      });

      expect(wrapper.find('Footer')).not.toBePresent();
      expect(wrapper.find('.__footer')).toBePresent();
    });
  });

  describe('with `id`', () => {
    beforeAll(() => {
      wrapper = setup({
        ...props,
        id: 'hello-world',
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should have added the id to the portal wrapper', () => {
      const namedPortal = document.getElementById('hello-world');

      expect(namedPortal).toBeInstanceOf(HTMLDivElement);
      expect(namedPortal.querySelector('.__tooltip')).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('with `open`', () => {
    beforeAll(() => {
      wrapper = setup({
        ...props,
        open: false,
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should not be able to show the tooltip with click', () => {
      updateTooltip('click');

      expect(wrapper.state('status')).toBe('idle');
    });

    it('should not be able to show the tooltip with hover', () => {
      wrapper.setProps({ event: 'hover' });
      updateTooltip('mouseEnter');

      expect(wrapper.state('status')).toBe('idle');
    });

    it('should show the tooltip when `open` is true', () => {
      wrapper.setProps({ open: true });
      expect(wrapper.state('status')).toBe('opening');

      wrapper.instance().handleTransitionEnd();
      expect(wrapper.state('status')).toBe('open');
    });

    it('should close the tooltip when `open` is false', () => {
      wrapper.setProps({ open: false });
      expect(wrapper.state('status')).toBe('closing');

      wrapper.instance().handleTransitionEnd();
      expect(wrapper.state('status')).toBe('idle');
    });
  });

  describe('with `placement` top', () => {
    beforeAll(() => {
      wrapper = setup({
        ...props,
        placement: 'top',
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should use `placement` top', () => {
      expect(wrapper.instance().popper.originalPlacement).toBe('top');
      expect(wrapper.state('currentPlacement')).toBe('top');
    });
  });

  describe('with `placement` center', () => {
    beforeAll(() => {
      wrapper = setup({
        ...props,
        placement: 'center',
      });
    });

    afterAll(() => {
      wrapper.unmount();
      wrapper.detach();

      portal.unmount();
    });

    it('should use `placement` center', () => {
      expect(wrapper.instance().popper).not.toBeDefined();
      expect(wrapper.state('currentPlacement')).toBe('center');
    });

    it('should have skipped the arrow', () => {
      updateTooltip();

      const tooltip = portal.find('.__tooltip');

      expect(wrapper.state('status')).toBe('open');
      expect(tooltip.find('.__tooltip__arrow')).not.toBePresent();
    });
  });

  describe('with showCloseButton', () => {

  });

  describe('with styles', () => {

  });

  describe('with target', () => {

  });

  describe('with title', () => {

  });

  describe('with wrapperOptions', () => {

  });
});

