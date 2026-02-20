/* eslint-disable testing-library/no-manual-cleanup */
import { ReactNode, StrictMode } from 'react';
import {
  act,
  cleanup,
  configure,
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';

import ReactFloater, { Props } from '../../src';

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

describe('useFloater', () => {
  let view: RenderResult;

  const unmountView = () => {
    view?.unmount();
    cleanup();
  };

  afterEach(() => {
    mockCallback.mockClear();
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

  describe('with `placement` center and `open` prop', () => {
    const centerProps = {
      ...props,
      open: false,
      placement: 'center' as const,
    };

    afterAll(unmountView);

    it('should not show when open is false', () => {
      view = setup(centerProps);

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });

    it('should show when open becomes true', async () => {
      view.rerender(
        <ReactFloater {...centerProps} open>
          Places
        </ReactFloater>,
      );

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });

    it('should hide when open becomes false', () => {
      view.rerender(
        <ReactFloater {...centerProps} open={false}>
          Places
        </ReactFloater>,
      );

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });

    it('should re-open when open becomes true again', async () => {
      view.rerender(
        <ReactFloater {...centerProps} open>
          Places
        </ReactFloater>,
      );

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });
  });

  describe('with `placement` center and `callback`', () => {
    const centerCallback = vi.fn();

    afterAll(unmountView);

    it('should call callback on open', async () => {
      view = setup({
        ...props,
        callback: centerCallback,
        placement: 'center',
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(centerCallback).toHaveBeenCalledWith(
        'open',
        expect.objectContaining({ placement: 'center' }),
      );
    });

    it('should call callback on close', () => {
      centerCallback.mockClear();

      fireEvent.click(screen.getByTestId(idWrapper));

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(centerCallback).toHaveBeenCalledWith(
        'close',
        expect.objectContaining({ placement: 'center' }),
      );
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

  // ---------------------------------------------------------------------------
  // Behavioral contract tests — observable guarantees that must survive refactors
  // ---------------------------------------------------------------------------

  describe('lifecycle: click open/close', () => {
    const lifecycleCallback = vi.fn();
    const lifecycleGetPopper = vi.fn();

    afterAll(unmountView);

    it('should start with floater absent', () => {
      view = setup({
        ...props,
        callback: lifecycleCallback,
        getPopper: lifecycleGetPopper,
      });

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
      expect(screen.getByTestId(idWrapper)).not.toHaveAttribute('aria-describedby');
    });

    it('should render floater hidden after click (RENDER state)', () => {
      fireEvent.click(screen.getByTestId(idWrapper));

      const floater = screen.getByTestId(id);
      const inner = floater.firstChild as HTMLElement;

      expect(floater).toBeInTheDocument();
      expect(inner).toHaveStyle({ opacity: 0, visibility: 'hidden' });
      expect(inner).not.toHaveClass('__floater__open');

      expect(lifecycleGetPopper).toHaveBeenCalledWith(expect.any(Object), 'floater');

      expect(screen.getByTestId(idWrapper)).not.toHaveAttribute('aria-describedby');
    });

    it('should transition to visible after transitionEnd (OPEN state)', () => {
      fireEvent.transitionEnd(screen.getByTestId(id));

      const inner = screen.getByTestId(id).firstChild as HTMLElement;

      expect(inner).toHaveClass('__floater__open');
      expect(inner).toHaveStyle({ opacity: 1, visibility: 'visible' });

      expect(screen.getByTestId(idWrapper)).toHaveAttribute('aria-describedby', id);

      expect(lifecycleCallback).toHaveBeenCalledWith('open', expect.objectContaining({ id }));
    });

    it('should start closing on second click (CLOSING state)', () => {
      lifecycleCallback.mockClear();

      fireEvent.click(screen.getByTestId(idWrapper));

      const inner = screen.getByTestId(id).firstChild as HTMLElement;

      expect(inner).toHaveStyle({ opacity: 0, visibility: 'visible' });
      expect(inner).not.toHaveClass('__floater__open');

      expect(screen.getByTestId(idWrapper)).toHaveAttribute('aria-describedby', id);
    });

    it('should remove floater after close transitionEnd (IDLE state)', () => {
      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();

      expect(screen.getByTestId(idWrapper)).not.toHaveAttribute('aria-describedby');

      expect(lifecycleCallback).toHaveBeenCalledWith('close', expect.objectContaining({ id }));
    });

    it('should complete a second open/close cycle', async () => {
      lifecycleCallback.mockClear();
      lifecycleGetPopper.mockClear();

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
      expect(lifecycleCallback).toHaveBeenCalledWith('open', expect.any(Object));
      expect(lifecycleGetPopper).toHaveBeenCalledWith(expect.any(Object), 'floater');

      lifecycleCallback.mockClear();

      fireEvent.click(screen.getByTestId(idWrapper));
      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
      expect(lifecycleCallback).toHaveBeenCalledWith('close', expect.any(Object));
    });
  });

  describe('lifecycle: hover open/close', () => {
    const hoverCallback = vi.fn();

    afterAll(unmountView);

    it('should open on mouseEnter', async () => {
      view = setup({
        ...props,
        callback: hoverCallback,
        event: 'hover',
      });

      fireEvent.mouseEnter(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
      expect(hoverCallback).toHaveBeenCalledWith('open', expect.any(Object));
    });

    it('should close after eventDelay on mouseLeave', async () => {
      hoverCallback.mockClear();

      fireEvent.mouseLeave(screen.getByTestId(idWrapper));

      expect(screen.getByTestId(id)).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
      expect(hoverCallback).toHaveBeenCalledWith('close', expect.any(Object));
    });
  });

  describe('lifecycle: hover cancel close on re-enter', () => {
    afterAll(unmountView);

    it('should cancel pending close when mouse re-enters during IDLE', async () => {
      view = setup({
        ...props,
        event: 'hover',
      });

      fireEvent.mouseEnter(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));
      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');

      fireEvent.mouseLeave(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      fireEvent.transitionEnd(screen.getByTestId(id));
      expect(screen.queryByTestId(id)).not.toBeInTheDocument();

      fireEvent.mouseEnter(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));
      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });
  });

  describe('lifecycle: controlled mode', () => {
    const controlledCallback = vi.fn();
    const controlledGetPopper = vi.fn();

    afterAll(unmountView);

    it('should not render floater when open=false', () => {
      view = setup({
        ...props,
        callback: controlledCallback,
        getPopper: controlledGetPopper,
        open: false,
      });

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });

    it('should ignore click in controlled mode', () => {
      fireEvent.click(screen.getByTestId(idWrapper));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });

    it('should open when open becomes true', async () => {
      view.rerender(
        <ReactFloater {...props} callback={controlledCallback} getPopper={controlledGetPopper} open>
          Places
        </ReactFloater>,
      );

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
      expect(controlledGetPopper).toHaveBeenCalledWith(expect.any(Object), 'floater');
      expect(controlledCallback).toHaveBeenCalledWith('open', expect.any(Object));
    });

    it('should close when open becomes false', () => {
      controlledCallback.mockClear();

      view.rerender(
        <ReactFloater
          {...props}
          callback={controlledCallback}
          getPopper={controlledGetPopper}
          open={false}
        >
          Places
        </ReactFloater>,
      );

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
      expect(controlledCallback).toHaveBeenCalledWith('close', expect.any(Object));
    });

    it('should re-open after close', async () => {
      controlledCallback.mockClear();
      controlledGetPopper.mockClear();

      view.rerender(
        <ReactFloater {...props} callback={controlledCallback} getPopper={controlledGetPopper} open>
          Places
        </ReactFloater>,
      );

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
      expect(controlledCallback).toHaveBeenCalledWith('open', expect.any(Object));
      expect(controlledGetPopper).toHaveBeenCalledWith(expect.any(Object), 'floater');
    });
  });

  describe('lifecycle: rapid controlled toggling', () => {
    afterAll(unmountView);

    it('should stabilize after rapid open→false→true', async () => {
      view = setup({
        ...props,
        open: true,
      });

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      view.rerender(
        <ReactFloater {...props} open={false}>
          Places
        </ReactFloater>,
      );

      view.rerender(
        <ReactFloater {...props} open>
          Places
        </ReactFloater>,
      );

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
    });
  });

  describe('lifecycle: popper recreation on close/reopen', () => {
    const popperSpy = vi.fn();

    afterAll(unmountView);

    it('should call getPopper on each open', () => {
      view = setup({
        ...props,
        getPopper: popperSpy,
      });

      popperSpy.mockClear();
      fireEvent.click(screen.getByTestId(idWrapper));

      const firstOpenCalls = popperSpy.mock.calls.filter(c => c[1] === 'floater');

      expect(firstOpenCalls).toHaveLength(1);

      fireEvent.transitionEnd(screen.getByTestId(id));
      fireEvent.click(screen.getByTestId(idWrapper));
      fireEvent.transitionEnd(screen.getByTestId(id));

      popperSpy.mockClear();
      fireEvent.click(screen.getByTestId(idWrapper));

      const secondOpenCalls = popperSpy.mock.calls.filter(c => c[1] === 'floater');

      expect(secondOpenCalls).toHaveLength(1);
    });
  });

  describe('lifecycle: center placement full cycle', () => {
    const centerCallback = vi.fn();

    afterAll(unmountView);

    it('should not create a popper instance for center placement', async () => {
      const centerGetPopper = vi.fn();

      view = setup({
        ...props,
        callback: centerCallback,
        getPopper: centerGetPopper,
        placement: 'center',
      });

      fireEvent.click(screen.getByTestId(idWrapper));

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(centerGetPopper).not.toHaveBeenCalled();
    });

    it('should use centered fixed positioning', () => {
      const inner = screen.getByTestId(id).firstChild as HTMLElement;

      expect(inner).toHaveStyle({
        position: 'fixed',
        left: '50%',
        top: '50%',
      });
    });

    it('should complete open/close cycle', () => {
      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
      expect(centerCallback).toHaveBeenCalledWith(
        'open',
        expect.objectContaining({ placement: 'center' }),
      );

      centerCallback.mockClear();

      fireEvent.click(screen.getByTestId(idWrapper));
      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
      expect(centerCallback).toHaveBeenCalledWith(
        'close',
        expect.objectContaining({ placement: 'center' }),
      );
    });
  });

  describe('lifecycle: hover with eventDelay=0', () => {
    afterAll(unmountView);

    it('should close immediately on mouseLeave', async () => {
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

      fireEvent.mouseLeave(screen.getByTestId(idWrapper));

      const inner = screen.getByTestId(id).firstChild as HTMLElement;

      expect(inner).toHaveStyle({ opacity: 0, visibility: 'visible' });

      fireEvent.transitionEnd(screen.getByTestId(id));

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });
  });

  describe('lifecycle: unmount during open', () => {
    it('should clean up without errors', async () => {
      view = setup({
        ...props,
        open: true,
      });

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(() => {
        view.unmount();
        cleanup();
      }).not.toThrowError();
    });

    it('should clean up during transition', () => {
      view = setup(props);

      fireEvent.click(screen.getByTestId(idWrapper));

      expect(() => {
        view.unmount();
        cleanup();
      }).not.toThrowError();
    });
  });

  describe('StrictMode', () => {
    it('should not auto-open uncontrolled floaters', async () => {
      const { unmount } = render(
        <StrictMode>
          <ReactFloater {...props}>Places</ReactFloater>
        </StrictMode>,
      );

      await act(async () => {
        vi.runOnlyPendingTimers();
      });

      expect(screen.queryByTestId(id)).not.toBeInTheDocument();

      unmount();
      cleanup();
    });
  });
});
