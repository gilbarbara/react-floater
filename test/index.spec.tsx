/* eslint-disable testing-library/no-manual-cleanup */
import { ReactNode } from 'react';
import {
  act,
  cleanup,
  configure,
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { MockInstance } from 'vitest';

import ReactFloater from '../src';
import { isFixed, log, portalId } from '../src/modules/helpers';
import getStyles from '../src/modules/styles';
import { Props } from '../src/types';

import { Button, Floaters, Styled } from './__fixtures__/components';

configure({
  testIdAttribute: 'id',
});

vi.useFakeTimers();

const mockCallback = vi.fn();
const mockGetPopper = vi.fn(() => ({ instance: {} }));

const id = 'test';
const idWrapper = `${id}-wrapper`;
const content = 'Hello! This is my content!';

const props: Props = {
  id,
  content,
  getPopper: mockGetPopper,
};

function setup(ownProps = props, children: ReactNode = 'Places') {
  return render(<ReactFloater {...ownProps}>{children}</ReactFloater>);
}

describe('ReactFloater', () => {
  let view: RenderResult;

  const unmountView = () => {
    view?.unmount();
    cleanup();
  };

  afterEach(() => {
    mockCallback.mockClear();
  });

  describe('basic usage', () => {
    afterAll(() => {
      mockGetPopper.mockClear();
      unmountView();
    });

    it('should render the element', () => {
      view = setup(props, 'Places');

      expect(screen.getByTestId(idWrapper)).toBeInTheDocument();
    });

    it('should render the portal, popper and floater', async () => {
      fireEvent.click(screen.getByTestId(idWrapper));
      const portal = document.getElementById('react-floater-portal');
      const popper = portal?.firstChild;

      expect(portal).toBeInTheDocument();
      expect(portal).toHaveStyle({ zIndex: 100 });
      expect(popper).toHaveStyle({ zIndex: 100 });

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater');
      expect(screen.getByTestId(id).firstChild).not.toHaveClass('__floater__open');
    });

    it('should have called getPopper', () => {
      expect(mockGetPopper).toHaveBeenCalledWith(expect.any(Object), 'floater');
    });

    it('should show the floater after the transition ends', () => {
      fireEvent.transitionEnd(screen.getByTestId(id));
      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });

    it('should hide the floater and remove the popper', async () => {
      fireEvent.click(screen.getByTestId(idWrapper));

      fireEvent.transitionEnd(screen.getByTestId(id));

      const portal = document.getElementById('react-floater-portal');
      const popper = portal?.firstChild;

      expect(portal).toBeInTheDocument();
      expect(popper).toBeNull();

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with multiple children', () => {
    afterAll(unmountView);

    it('should render the element', () => {
      view = setup(
        props,
        <>
          <span>Hello</span> <span>world</span>
        </>,
      );

      expect(screen.getByTestId(idWrapper)).toBeInTheDocument();
    });

    it('should render the floater', async () => {
      fireEvent.click(screen.getByTestId(idWrapper));

      expect(screen.getByTestId(id)).toBeInTheDocument();
    });

    it('should hide the floater', async () => {
      fireEvent.click(screen.getByTestId(idWrapper));

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with multiple instances', () => {
    afterAll(unmountView);

    it('should render the elements', () => {
      view = render(<Floaters />);

      expect(screen.getByTestId('president-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('republic-wrapper')).toBeInTheDocument();
    });

    it('should render the floaters', async () => {
      fireEvent.click(screen.getByTestId('president-wrapper'));
      fireEvent.click(screen.getByTestId('republic-wrapper'));

      expect(screen.getByTestId('president')).toHaveTextContent('It was that bearded guy!');
      expect(screen.getByTestId('republic')).toHaveTextContent('You know what I mean');
    });

    it('should hide the floaters', async () => {
      fireEvent.click(screen.getByTestId('president-wrapper'));
      fireEvent.click(screen.getByTestId('republic-wrapper'));

      fireEvent.transitionEnd(screen.getByTestId('president'));
      fireEvent.transitionEnd(screen.getByTestId('republic'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `portalElement`', () => {
    let element: HTMLDivElement;

    beforeAll(() => {
      element = document.createElement('div');
      element.id = 'floaters';

      document.body.appendChild(element);
    });

    afterAll(() => {
      unmountView();
      document.body.removeChild(element);
    });

    it('should render in the "portalElement"', async () => {
      view = render(<Floaters portalElement={element} />);

      expect(screen.queryByTestId(portalId)).not.toBeInTheDocument();
      expect(screen.getByTestId('floaters')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('president-wrapper'));
      fireEvent.click(screen.getByTestId('republic-wrapper'));

      expect(screen.getByTestId('president')).toHaveTextContent('It was that bearded guy!');
      expect(screen.getByTestId('republic')).toHaveTextContent('You know what I mean');
    });
  });

  describe('with `autoOpen`', () => {
    afterAll(unmountView);

    it('should have rendered the Floater initially open', async () => {
      view = setup({
        ...props,
        autoOpen: true,
      });

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));
      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });

    it('should hide the floater', async () => {
      fireEvent.click(screen.getByTestId(idWrapper));

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });

    it('should show the floater again', async () => {
      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });
  });

  describe('with `callback`', () => {
    afterAll(unmountView);

    it('should call the callback function on open', async () => {
      view = setup({
        ...props,
        callback: mockCallback,
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(mockCallback).toHaveBeenCalledWith('open', {
        autoOpen: false,
        callback: mockCallback,
        children: 'Places',
        content: 'Hello! This is my content!',
        debug: false,
        disableFlip: false,
        disableHoverToClick: false,
        event: 'click',
        eventDelay: 0.4,
        getPopper: mockGetPopper,
        hideArrow: false,
        id,
        offset: 15,
        placement: 'bottom',
        showCloseButton: false,
        styles: {},
        target: null,
        wrapperOptions: { position: false },
      });
    });

    it('should call the callback function on close', async () => {
      fireEvent.click(screen.getByTestId(idWrapper));

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(mockCallback).toHaveBeenCalledWith('close', {
        autoOpen: false,
        callback: mockCallback,
        children: 'Places',
        content: 'Hello! This is my content!',
        debug: false,
        disableFlip: false,
        disableHoverToClick: false,
        event: 'click',
        eventDelay: 0.4,
        getPopper: mockGetPopper,
        hideArrow: false,
        id,
        offset: 15,
        placement: 'bottom',
        showCloseButton: false,
        styles: {},
        target: null,
        wrapperOptions: { position: false },
      });
    });
  });

  describe('with `debug`', () => {
    let consoleGroupCollapsed: MockInstance;
    let consoleLog: MockInstance;

    beforeAll(() => {
      consoleGroupCollapsed = vi
        .spyOn(console, 'groupCollapsed')
        .mockImplementation(() => undefined);
      consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterAll(() => {
      consoleGroupCollapsed.mockRestore();
      consoleLog.mockRestore();
      unmountView();
    });

    it('should be able to show and hide the floater', async () => {
      view = setup({
        ...props,
        debug: true,
      });

      expect(consoleGroupCollapsed).toHaveBeenCalledWith(
        '%creact-floater: init',
        'color: #9b00ff; font-weight: bold; font-size: 12px;',
      );

      expect(consoleLog).toHaveBeenCalledWith(
        expect.objectContaining({
          floater: null,
          hasChildren: true,
          hasTarget: false,
          isControlled: false,
          positionWrapper: false,
          target: expect.anything(),
        }),
      );

      fireEvent.click(screen.getByTestId(idWrapper));

      expect(consoleGroupCollapsed).toHaveBeenCalledWith(
        '%creact-floater: click',
        'color: #9b00ff; font-weight: bold; font-size: 12px;',
      );
      expect(consoleLog).toHaveBeenCalledWith({ event: 'click', status: 'opening' });

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');

      expect(consoleGroupCollapsed).toHaveBeenCalledTimes(2);
      expect(consoleLog).toHaveBeenCalledTimes(2);
    });
  });

  describe('with `event` hover', () => {
    afterAll(unmountView);

    it('should be able to show the floater', async () => {
      view = setup({
        ...props,
        event: 'hover',
        disableHoverToClick: true,
      });

      fireEvent.mouseEnter(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });

    it('should close itself after `eventDelay`', async () => {
      fireEvent.mouseLeave(screen.getByTestId(idWrapper));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId(id).firstChild).not.toHaveClass('__floater__open');

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `event` hover and `eventDelay` set to 0', () => {
    afterAll(unmountView);

    it('should be able to show the floater', async () => {
      view = setup({
        ...props,
        event: 'hover',
        eventDelay: 0,
      });

      fireEvent.mouseEnter(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });

    it('should have close itself immediately', async () => {
      fireEvent.mouseLeave(screen.getByTestId(idWrapper));

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `title`, `footer` and `closeBtn`', () => {
    afterAll(unmountView);

    it('should render the floater', async () => {
      view = setup({
        ...props,
        footer: 'Footer',
        showCloseButton: true,
        title: 'Title',
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });
  });

  describe('with `open`', () => {
    const localProps = {
      ...props,
      open: false,
    };

    afterAll(unmountView);

    it('should not be able to show the floater with click', async () => {
      view = setup(localProps);

      fireEvent.click(screen.getByTestId(idWrapper));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });

    it('should not be able to show the floater with hover', async () => {
      view = setup({ ...localProps, event: 'hover' });

      fireEvent.mouseEnter(screen.getAllByTestId(idWrapper)[0]);

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });

    it('should show the floater when `open` is true', async () => {
      view.rerender(
        <ReactFloater {...localProps} open>
          {content}
        </ReactFloater>,
      );

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });

    it('should close the floater when `open` is false', async () => {
      view.rerender(
        <ReactFloater {...localProps} open={false}>
          {content}
        </ReactFloater>,
      );

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });
  });

  describe('with `component` as function', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup(
        {
          ...props,
          content: undefined,
          component: Styled,
        },
        <Button />,
      );

      fireEvent.click(screen.getByTestId('button'));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });

    it('should close the floater with `closeFn` prop', async () => {
      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `component` as element', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup(
        {
          ...props,
          content: undefined,
          component: <Styled />,
          styles: {
            options: {
              zIndex: 1000,
            },
          },
        },
        <span>Places</span>,
      );

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });

    it('should close the floater with `closeFn` prop', async () => {
      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `placement` top', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup({
        ...props,
        placement: 'top',
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });
  });

  describe('with `placement` left', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup({
        ...props,
        placement: 'left',
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });
  });

  describe('with `placement` right', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup({
        ...props,
        placement: 'right',
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });
  });

  describe('with `placement` center', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup({
        ...props,
        placement: 'center',
      });
      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });
  });

  describe('with `wrapperOptions`', () => {
    afterAll(unmountView);

    it('should render properly', async () => {
      view = render(
        <>
          <span className="external" id="external">
            external
          </span>
          <ReactFloater
            content={
              <div style={{ fontSize: 32 }}>Yeah, this is how we use to look back in the day!</div>
            }
            disableFlip
            id={id}
            placement="top"
            target=".external"
            wrapperOptions={{
              offset: -20,
              placement: 'bottom',
              position: true,
            }}
          >
            <span id="beacon">Beacon</span>
          </ReactFloater>
        </>,
      );

      fireEvent.click(screen.getByTestId('test-wrapper'));

      expect(screen.getByTestId(idWrapper)).toHaveStyle('visibility: hidden');
      expect(screen.getByTestId(id)).toHaveTextContent(
        'Yeah, this is how we use to look back in the day!',
      );
    });
  });

  describe('with `arrow`', () => {
    afterAll(unmountView);

    it('should render a custom arrow floater with click', async () => {
      view = setup({
        ...props,
        arrow: (
          <svg
            height="100px"
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
        ),
        styles: {
          arrow: {
            color: '#6ba2ff',
            size: 80,
            base: 10,
          },
        },
      });
      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });
  });

  describe('with custom `arrow` and `placement` left', () => {
    afterAll(unmountView);

    it('should render with left/right size swap', async () => {
      view = setup({
        ...props,
        placement: 'left',
        arrow: <span>arrow</span>,
        styles: {
          arrow: {
            color: '#6ba2ff',
            size: 80,
            base: 10,
          },
        },
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });
  });

  describe('with `portalElement` as string selector', () => {
    let element: HTMLDivElement;

    beforeAll(() => {
      element = document.createElement('div');
      element.id = 'string-portal';
      document.body.appendChild(element);
    });

    afterAll(() => {
      unmountView();
      document.body.removeChild(element);
    });

    it('should render in the element found by selector', async () => {
      view = setup({
        ...props,
        portalElement: '#string-portal',
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      expect(screen.getByTestId('string-portal')).toBeInTheDocument();
      expect(screen.getByTestId(id)).toHaveTextContent(content);
    });
  });

  describe('with controlled `open` and `event` hover', () => {
    afterAll(unmountView);

    it('should ignore mouseEnter and mouseLeave', async () => {
      view = setup({
        ...props,
        open: true,
        event: 'hover',
      });

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');

      fireEvent.mouseEnter(screen.getByTestId(idWrapper));
      fireEvent.mouseLeave(screen.getByTestId(idWrapper));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });
  });

  describe('with `event` hover and `wrapperOptions`', () => {
    afterAll(unmountView);

    it('should handle click in hover+positionWrapper mode', async () => {
      view = render(
        <>
          <span className="hover-target" id="hover-target">
            target
          </span>
          <ReactFloater
            content={<div>Hover content</div>}
            event="hover"
            id={id}
            placement="top"
            target=".hover-target"
            wrapperOptions={{
              placement: 'bottom',
              position: true,
            }}
          >
            <span>Beacon</span>
          </ReactFloater>
        </>,
      );

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });

  describe('with ReactElement `title` and `footer`', () => {
    afterAll(unmountView);

    it('should render ReactElement title and footer', async () => {
      view = setup({
        ...props,
        title: <h2>Custom Title</h2>,
        footer: <div>Custom Footer</div>,
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toMatchSnapshot();
    });
  });

  describe('with changing `wrapperOptions`', () => {
    afterAll(unmountView);

    it('should update positionWrapper when props change', async () => {
      view = render(
        <>
          <span className="change-target" id="change-target">
            target
          </span>
          <ReactFloater
            content={<div>Content</div>}
            id={id}
            target=".change-target"
            wrapperOptions={{ position: true }}
          >
            <span>Beacon</span>
          </ReactFloater>
        </>,
      );

      view.rerender(
        <>
          <span className="change-target" id="change-target">
            target
          </span>
          <ReactFloater
            content={<div>Content</div>}
            id={id}
            target=".change-target"
            wrapperOptions={{ position: false }}
          >
            <span>Beacon</span>
          </ReactFloater>
        </>,
      );

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(idWrapper)).toBeInTheDocument();
    });
  });

  describe('with `target` as DOM element', () => {
    let element: HTMLSpanElement;

    beforeAll(() => {
      element = document.createElement('span');
      element.id = 'dom-target';
      document.body.appendChild(element);
    });

    afterAll(() => {
      unmountView();
      document.body.removeChild(element);
    });

    it('should render with a DOM element target', async () => {
      view = setup({
        ...props,
        target: element,
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
  });

  describe('portal cleanup', () => {
    it('should remove the portal when the last instance unmounts', () => {
      const { unmount } = setup(props);

      expect(document.getElementById(portalId)).toBeInTheDocument();

      unmount();

      expect(document.getElementById(portalId)).not.toBeInTheDocument();
    });
  });

  describe('helpers', () => {
    it('isFixed should return true for fixed-position elements', () => {
      const parent = document.createElement('div');

      parent.style.position = 'fixed';
      document.body.appendChild(parent);

      const child = document.createElement('span');

      parent.appendChild(child);

      expect(isFixed(child)).toBe(true);

      document.body.removeChild(parent);
    });

    it('log should handle non-array data', () => {
      const consoleGroupCollapsed = vi
        .spyOn(console, 'groupCollapsed')
        .mockImplementation(() => undefined);
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      log({ title: 'test', data: { key: 'value' }, debug: true });

      expect(consoleGroupCollapsed).toHaveBeenCalled();
      expect(consoleLog).toHaveBeenCalledWith({ key: 'value' });

      consoleGroupCollapsed.mockRestore();
      consoleLog.mockRestore();
    });
  });

  describe('styles', () => {
    it('getStyles should work with no argument', () => {
      const styles = getStyles();

      expect(styles.options.zIndex).toBe(100);
    });

    it('getStyles should work with undefined', () => {
      const styles = getStyles(undefined);

      expect(styles.options.zIndex).toBe(100);
    });
  });
});
