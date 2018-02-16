import React from 'react';
import { mount } from 'enzyme';

import ReactTooltips from '../src';

import Styled from './__fixtures__/Styled';

jest.useFakeTimers();

const mockCallback = jest.fn();
const props = {
  content: 'Hello! This is my content!',
};

function setup(ownProps = props, children = 'Places') {
  return mount(
    <ReactTooltips {...ownProps}>
      {children}
    </ReactTooltips>,
    { attachTo: document.getElementById('react') }
  );
}

describe('ReactTooltips', () => {
  let portal;
  let tooltip;

  const updateTooltip = (event = 'click') => {
    if (event) {
      tooltip.find('Wrapper').childAt(0).simulate(event);

      if (['click', 'mouseEnter'].includes(event)) {
        tooltip.instance().handleTransitionEnd(); // mock transitionend
      }
      else {
        setTimeout(() => {
          tooltip.instance().handleTransitionEnd();
        }, tooltip.prop('eventDelay') * 1100);
      }
    }

    tooltip.update();
    portal = mount(tooltip.find('Portal').get(0));
  };

  describe('basic usage', () => {
    beforeAll(() => {
      tooltip = setup();
      portal = mount(tooltip.find('Portal').get(0));
    });

    it('should render properly', () => {
      expect(tooltip.find('ReactTooltips')).toBePresent();
      expect(tooltip.find('Portal')).toBePresent();
      expect(tooltip.find('Wrapper span').at(0)).toHaveText('Places');
    });

    it('should have created a Portal', () => {
      expect(portal.find('.__tooltip')).toBePresent();
      expect(portal.find('.__tooltip__container')).toBePresent();
      expect(portal.find('.__tooltip__arrow')).toBePresent();
    });

    it('should have rendered the Tooltip initially hidden', () => {
      const tooltipEl = portal.find('.__tooltip');

      expect(tooltip.state('status')).toBe('idle');
      expect(tooltip.find('.__tooltip__container')).toHaveText('Hello! This is my content!');
      expect(tooltipEl).toHaveStyle('opacity', 0);
      expect(tooltipEl).toHaveStyle('visibility', 'hidden');
    });

    it('should be able to show the tooltip', () => {
      updateTooltip();
      const tooltipEl = portal.find('.__tooltip');

      expect(tooltip.state('status')).toBe('open');
      expect(tooltipEl).toHaveStyle('opacity', 1);
      expect(tooltipEl).toHaveStyle('visibility', 'visible');
    });

    it('should be able to hide the tooltip', () => {
      updateTooltip();
      const tooltipEl = portal.find('.__tooltip');

      expect(tooltip.state('status')).toBe('idle');
      expect(tooltipEl).toHaveStyle('opacity', 0);
      expect(tooltipEl).toHaveStyle('visibility', 'hidden');
    });

    it('should unmount properly', () => {
      tooltip.unmount();
      expect(tooltip.find('ReactTooltips')).not.toBePresent();

      portal.unmount();
      expect(portal.find('Portal')).not.toBePresent();
    });
  });

  describe('with multiple children', () => {
    beforeAll(() => {
      tooltip = setup(props, [
        <div key={0}>Hello</div>,
        <div key={1}>World</div>
      ]);
      portal = mount(tooltip.find('Portal').get(0));
    });

    it('should render properly', () => {
      const content = tooltip.find('Wrapper').childAt(0).find('div');

      expect(tooltip.find('ReactTooltips')).toBePresent();
      expect(tooltip.find('Portal')).toBePresent();
      expect(content.at(0)).toHaveText('Hello');
      expect(content.at(1)).toHaveText('World');
    });
  });

  describe('with `autoOpen`', () => {
    beforeAll(() => {
      tooltip = setup({
        ...props,
        autoOpen: true,
      });
    });

    it('should have rendered the Tooltip initially open', () => {
      updateTooltip(false);
      const tooltipEl = portal.find('.__tooltip');

      expect(tooltip.state('status')).toBe('open');
      expect(tooltipEl).toHaveStyle('opacity', 1);
      expect(tooltipEl).toHaveStyle('visibility', 'visible');
    });

    it('should be able to hide the tooltip', () => {
      updateTooltip();
      const tooltipEl = portal.find('.__tooltip');

      expect(tooltip.state('status')).toBe('idle');
      expect(tooltipEl).toHaveStyle('opacity', 0);
      expect(tooltipEl).toHaveStyle('visibility', 'hidden');
    });

    it('should be able to show the tooltip again', () => {
      updateTooltip();
      const tooltipEl = portal.find('.__tooltip');

      expect(tooltip.state('status')).toBe('open');
      expect(tooltipEl).toHaveStyle('opacity', 1);
      expect(tooltipEl).toHaveStyle('visibility', 'visible');
    });
  });

  describe('with `callback`', () => {
    beforeAll(() => {
      tooltip = setup({
        ...props,
        callback: mockCallback,
      });
    });

    it('should call the callback function on open', () => {
      updateTooltip();

      expect(tooltip.state('status')).toBe('open');
      expect(mockCallback).toHaveBeenCalledWith('open', {
        autoOpen: false,
        callback: mockCallback,
        children: 'Places',
        content: 'Hello! This is my content!',
        disableAnimation: false,
        disableFlip: false,
        disableHoverToClick: false,
        event: 'click',
        eventDelay: 0.4,
        hideArrow: false,
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
      expect(tooltip.state('status')).toBe('idle');

      expect(mockCallback).toHaveBeenCalledWith('close', {
        autoOpen: false,
        callback: mockCallback,
        children: 'Places',
        content: 'Hello! This is my content!',
        disableAnimation: false,
        disableFlip: false,
        disableHoverToClick: false,
        event: 'click',
        eventDelay: 0.4,
        hideArrow: false,
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
      tooltip = setup({
        ...props,
        event: 'hover',
      });
    });

    it('should be able to show the tooltip', () => {
      updateTooltip('mouseEnter');

      expect(tooltip.state('status')).toBe('open');
    });

    it('should still be open while the cursor is over it', () => {
      updateTooltip(false);

      expect(tooltip.state('status')).toBe('open');
    });

    it('should have close itself after `eventDelay`', () => {
      updateTooltip('mouseLeave');

      jest.advanceTimersByTime(tooltip.prop('eventDelay') * 1000); // trigger the close animation
      expect(tooltip.state('status')).toBe('closing');

      jest.advanceTimersByTime(400); // trigger the fake transitionend event
      expect(tooltip.state('status')).toBe('idle');
    });
  });

  describe('with `event` hover and `eventDelay` set to 0', () => {
    beforeAll(() => {
      tooltip = setup({
        ...props,
        event: 'hover',
        eventDelay: 0,
      });
    });

    it('should be able to show the tooltip', () => {
      updateTooltip('mouseEnter');

      expect(tooltip.state('status')).toBe('open');
    });

    it('should have close itself immediately', () => {
      updateTooltip('mouseLeave');

      expect(tooltip.state('status')).toBe('idle');

      jest.advanceTimersByTime(0); // trigger the fake transitionend event

      expect(tooltip.state('status')).toBe('idle');
    });
  });

  describe('with `title`', () => {
    beforeAll(() => {
      const Title = () => (<h3>My Title</h3>);
      tooltip = setup({
        ...props,
        title: (<Title />),
      });
    });

    it('should have rendered the title', () => {
      expect(tooltip.find('Title')).toBePresent();

      tooltip.setProps({
        title: (<div className="__title">Other Title</div>)
      });

      expect(tooltip.find('Title')).not.toBePresent();
      expect(tooltip.find('.__title')).toBePresent();
    });
  });

  describe('with `footer`', () => {
    beforeAll(() => {
      const Footer = () => (
        <footer>
          <button>NEXT</button>
        </footer>
      );
      tooltip = setup({
        ...props,
        footer: (<Footer />),
      });
    });

    it('should have rendered the footer', () => {
      expect(tooltip.find('Footer')).toBePresent();

      tooltip.setProps({
        footer: (<div className="__footer">Hello</div>)
      });

      expect(tooltip.find('Footer')).not.toBePresent();
      expect(tooltip.find('.__footer')).toBePresent();
    });
  });

  describe('with `id`', () => {
    beforeAll(() => {
      tooltip = setup({
        ...props,
        id: 'hello-world',
      });
    });

    it('should have added the id to the portal tooltip', () => {
      const namedPortal = document.getElementById('hello-world');

      expect(namedPortal).toBeInstanceOf(HTMLDivElement);
      expect(namedPortal.querySelector('.__tooltip')).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('with `open`', () => {
    beforeAll(() => {
      tooltip = setup({
        ...props,
        open: false,
      });
    });

    it('should not be able to show the tooltip with click', () => {
      updateTooltip('click');

      expect(tooltip.state('status')).toBe('idle');
    });

    it('should not be able to show the tooltip with hover', () => {
      tooltip.setProps({ event: 'hover' });
      updateTooltip('mouseEnter');

      expect(tooltip.state('status')).toBe('idle');
    });

    it('should show the tooltip when `open` is true', () => {
      tooltip.setProps({ open: true });
      expect(tooltip.state('status')).toBe('opening');

      tooltip.instance().handleTransitionEnd();
      expect(tooltip.state('status')).toBe('open');
    });

    it('should close the tooltip when `open` is false', () => {
      tooltip.setProps({ open: false });
      expect(tooltip.state('status')).toBe('closing');

      tooltip.instance().handleTransitionEnd();
      expect(tooltip.state('status')).toBe('idle');
    });
  });

  describe('with `placement` top', () => {
    beforeAll(() => {
      tooltip = setup({
        ...props,
        placement: 'top',
      });
    });

    it('should use `placement` top', () => {
      expect(tooltip.instance().popper.originalPlacement).toBe('top');
      expect(tooltip.state('currentPlacement')).toBe('top');
    });
  });

  describe('with `placement` center', () => {
    beforeAll(() => {
      tooltip = setup({
        ...props,
        placement: 'center',
      });
    });

    it('should use `placement` center', () => {
      expect(tooltip.instance().popper).not.toBeDefined();
      expect(tooltip.state('currentPlacement')).toBe('center');
    });

    it('should have skipped the arrow', () => {
      updateTooltip();

      const tooltipEl = portal.find('.__tooltip');

      expect(tooltip.state('status')).toBe('open');
      expect(tooltipEl.find('.__tooltip__arrow')).not.toBePresent();
    });
  });

  describe('with `component` as function', () => {
    beforeAll(() => {
      tooltip = setup({
        component: Styled,
      });
    });

    it('should show the tooltip with click', () => {
      updateTooltip('click');

      expect(tooltip.state('status')).toBe('open');
    });

    it('should have a StyledComponent', () => {
      expect(tooltip.find('StyledComponent')).toBePresent();
    });

    it('should be able to close the tooltip with `closeTooltip` prop', () => {
      tooltip.find('StyledComponent').find('button').simulate('click');

      expect(tooltip.state('status')).toBe('closing');
    });
  });

  describe('with `component` as element', () => {
    beforeAll(() => {
      tooltip = setup({
        component: <Styled />,
      });
    });

    it('should show the tooltip with click', () => {
      updateTooltip('click');

      expect(tooltip.state('status')).toBe('open');
    });

    it('should have a StyledComponent', () => {
      expect(tooltip.find('StyledComponent')).toBePresent();
    });

    it('should be able to close the tooltip with `closeTooltip` prop', () => {
      tooltip.find('StyledComponent').find('button').simulate('click');

      expect(tooltip.state('status')).toBe('closing');
    });
  });

  describe('with `showCloseButton`', () => {
    beforeAll(() => {
      tooltip = setup({
        ...props,
        showCloseButton: true,
      });
    });

    it('should show the tooltip with click', () => {
      updateTooltip('click');

      expect(tooltip.state('status')).toBe('open');
    });

    it('should have a close button', () => {
      expect(tooltip.find('CloseBtn')).toBePresent();
    });

    it('should be able to close the tooltip clicking the close button', () => {
      tooltip.find('CloseBtn').simulate('click');

      expect(tooltip.state('status')).toBe('closing');
    });
  });

  describe('with `styles`', () => {

  });

  describe('with `target`', () => {

  });

  describe('with `wrapperOptions`', () => {

  });
});

