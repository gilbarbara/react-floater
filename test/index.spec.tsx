import * as React from 'react';
import {
  act,
  cleanup,
  configure,
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react/pure';

import { Button, Floaters, Styled } from './__fixtures__/components';

import ReactFloater from '../src';
import { portalId } from '../src/modules/helpers';
import { Props } from '../src/types';

configure({
  testIdAttribute: 'id',
});

jest.useFakeTimers();

const mockCallback = jest.fn();
const mockGetPopper = jest.fn(() => ({ instance: {} }));

const id = 'test';
const content = 'Hello! This is my content!';

const props: Props = {
  id,
  content,
  getPopper: mockGetPopper,
};

function setup(ownProps = props, children: React.ReactNode = 'Places') {
  return render(<ReactFloater {...ownProps}>{children}</ReactFloater>);
}

describe('ReactFloater', () => {
  let view: RenderResult;

  const unmountView = () => {
    view?.unmount();
    cleanup();
  };

  const getByDataId = (dataId = id) => {
    return view.container.querySelector(`[data-id="${dataId}"]`) || document;
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

      expect(getByDataId()).toBeInTheDocument();
    });

    it('should render the portal, popper and floater', async () => {
      fireEvent.click(getByDataId());
      const portal = document.getElementById('react-floater-portal');
      const popper = portal?.firstChild;

      expect(portal).toBeInTheDocument();
      expect(portal).toHaveStyle({ zIndex: 100 });
      expect(popper).toHaveStyle({ zIndex: 100 });

      expect(screen.getByTestId('test')).toHaveClass('__floater');
      expect(screen.getByTestId('test')).not.toHaveClass('__floater__open');
    });

    it('should have called getPopper', () => {
      expect(mockGetPopper).toHaveBeenCalledWith(expect.any(Object), 'floater');
    });

    it('should show the floater after the transition ends', () => {
      fireEvent.transitionEnd(screen.getByTestId('test'));
      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should hide the floater and remove the popper', async () => {
      fireEvent.click(getByDataId());

      fireEvent.transitionEnd(screen.getByTestId('test'));

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

      expect(getByDataId()).toBeInTheDocument();
    });

    it('should render the floater', async () => {
      fireEvent.click(getByDataId());

      expect(screen.getByTestId('test')).toBeInTheDocument();
    });

    it('should hide the floater', async () => {
      fireEvent.click(getByDataId());

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with multiple instances', () => {
    afterAll(unmountView);

    it('should render the elements', () => {
      view = render(<Floaters />);

      expect(getByDataId('president')).toBeInTheDocument();
      expect(getByDataId('republic')).toBeInTheDocument();
    });

    it('should render the floaters', async () => {
      fireEvent.click(getByDataId('president'));
      fireEvent.click(getByDataId('republic'));

      expect(screen.getByTestId('president')).toHaveTextContent('It was that bearded guy!');
      expect(screen.getByTestId('republic')).toHaveTextContent('You know what I mean');
    });

    it('should hide the floaters', async () => {
      fireEvent.click(getByDataId('president'));
      fireEvent.click(getByDataId('republic'));

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

      fireEvent.click(getByDataId('president'));
      fireEvent.click(getByDataId('republic'));

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
        jest.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));
      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should hide the floater', async () => {
      fireEvent.click(getByDataId());

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });

    it('should show the floater again', async () => {
      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });
  });

  describe('with `callback`', () => {
    afterAll(unmountView);

    it('should call the callback function on open', async () => {
      view = setup({
        ...props,
        callback: mockCallback,
      });

      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

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
      fireEvent.click(getByDataId());

      fireEvent.transitionEnd(screen.getByTestId('test'));

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
    let consoleGroupCollapsed: jest.SpyInstance;
    let consoleLog: jest.SpyInstance;

    beforeAll(() => {
      consoleGroupCollapsed = jest
        .spyOn(console, 'groupCollapsed')
        .mockImplementation(() => undefined);
      consoleLog = jest.spyOn(console, 'log').mockImplementation(() => undefined);
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

      fireEvent.click(getByDataId());

      expect(consoleGroupCollapsed).toHaveBeenCalledWith(
        '%creact-floater: click',
        'color: #9b00ff; font-weight: bold; font-size: 12px;',
      );
      expect(consoleLog).toHaveBeenCalledWith({ event: 'click', status: 'opening' });

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');

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

      fireEvent.mouseEnter(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should close itself after `eventDelay`', async () => {
      fireEvent.mouseLeave(getByDataId());

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('test')).not.toHaveClass('__floater__open');

      fireEvent.transitionEnd(screen.getByTestId('test'));

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

      fireEvent.mouseEnter(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should have close itself immediately', async () => {
      fireEvent.mouseLeave(getByDataId());

      fireEvent.transitionEnd(screen.getByTestId('test'));

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

      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toMatchSnapshot();
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

      fireEvent.click(getByDataId());

      expect(screen.queryByTestId('test')).not.toBeInTheDocument();
    });

    it('should not be able to show the floater with hover', async () => {
      view = setup({ ...localProps, event: 'hover' });

      fireEvent.mouseEnter(getByDataId());

      expect(screen.queryByTestId('test')).not.toBeInTheDocument();
    });

    it('should show the floater when `open` is true', async () => {
      view.rerender(
        <ReactFloater {...localProps} open>
          {content}
        </ReactFloater>,
      );

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should close the floater when `open` is false', async () => {
      view.rerender(
        <ReactFloater {...localProps} open={false}>
          {content}
        </ReactFloater>,
      );

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.queryByTestId('test')).not.toBeInTheDocument();
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

      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });

    it('should close the floater with `closeFn` prop', async () => {
      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      fireEvent.transitionEnd(screen.getByTestId('test'));

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

      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });

    it('should close the floater with `closeFn` prop', async () => {
      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      fireEvent.transitionEnd(screen.getByTestId('test'));

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

      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });
  });

  describe('with `placement` left', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup({
        ...props,
        placement: 'left',
      });

      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });
  });

  describe('with `placement` right', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup({
        ...props,
        placement: 'right',
      });

      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });
  });

  describe('with `placement` center', () => {
    afterAll(unmountView);

    it('should show the floater with click', async () => {
      view = setup({
        ...props,
        placement: 'center',
      });
      fireEvent.click(getByDataId());

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });
  });

  describe('with `wrapperOptions`', () => {
    afterAll(unmountView);

    it('should render properly', () => {
      view = render(
        <>
          <span className="external" data-id="external">
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
            <span data-id="beacon" />
          </ReactFloater>
        </>,
      );

      expect(getByDataId('external')).toBeInTheDocument();

      fireEvent.click(document.querySelector('[data-id="test"]') || document);

      expect(screen.getByTestId('test')).toHaveTextContent(
        'Yeah, this is how we use to look back in the day!',
      );
    });
  });
});
