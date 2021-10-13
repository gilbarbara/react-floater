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
    beforeAll(() => {
      view = setup(props, 'Places');
    });

    afterAll(() => {
      mockGetPopper.mockClear();
      unmountView();
    });

    it('should render the element', () => {
      expect(getByDataId()).toBeInTheDocument();
    });

    it('should render the floater', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

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

    it('should hide the floater', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with multiple children', () => {
    beforeAll(() => {
      view = setup(
        props,
        <>
          <span>Hello</span> <span>world</span>
        </>,
      );
    });
    afterAll(unmountView);

    it('should render the element', () => {
      expect(getByDataId()).toBeInTheDocument();
    });

    it('should render the floater', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      expect(screen.getByTestId('test')).toBeInTheDocument();
    });

    it('should hide the floater', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with multiple instances', () => {
    beforeAll(() => {
      view = render(<Floaters />);
    });
    afterAll(unmountView);

    it('should render the elements', () => {
      expect(getByDataId('president')).toBeInTheDocument();
      expect(getByDataId('republic')).toBeInTheDocument();
    });

    it('should render the floaters', async () => {
      await act(async () => {
        fireEvent.click(getByDataId('president'));
        fireEvent.click(getByDataId('republic'));
      });

      expect(screen.getByTestId('president')).toHaveTextContent('It was that bearded guy!');
      expect(screen.getByTestId('republic')).toHaveTextContent('You know what I mean');
    });

    it('should hide the floaters', async () => {
      await act(async () => {
        fireEvent.click(getByDataId('president'));
        fireEvent.click(getByDataId('republic'));
      });

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
      view = render(<Floaters portalElement={element} />);
    });

    afterAll(() => {
      unmountView();
      document.body.removeChild(element);
    });

    it('should render in the "portalElement"', async () => {
      expect(screen.queryByTestId(portalId)).not.toBeInTheDocument();
      expect(screen.getByTestId('floaters')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(getByDataId('president'));
        fireEvent.click(getByDataId('republic'));
      });

      expect(screen.getByTestId('president')).toHaveTextContent('It was that bearded guy!');
      expect(screen.getByTestId('republic')).toHaveTextContent('You know what I mean');
    });
  });

  describe('with `autoOpen`', () => {
    beforeAll(async () => {
      await act(async () => {
        view = setup({
          ...props,
          autoOpen: true,
        });
      });
    });

    afterAll(unmountView);

    it('should have rendered the Floater initially open', () => {
      fireEvent.transitionEnd(screen.getByTestId('test'));
      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should hide the floater', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });

    it('should show the floater again', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });
  });

  describe('with `callback`', () => {
    beforeAll(() => {
      view = setup({
        ...props,
        callback: mockCallback,
      });
    });

    afterAll(unmountView);

    it('should call the callback function on open', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
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
      await act(async () => {
        fireEvent.click(getByDataId());
      });

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

  describe('with `event` hover', () => {
    beforeAll(() => {
      view = setup({
        ...props,
        event: 'hover',
      });
    });

    afterAll(unmountView);

    it('should be able to show the floater', async () => {
      await act(async () => {
        fireEvent.mouseEnter(getByDataId());
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should close itself after `eventDelay`', async () => {
      await act(async () => {
        fireEvent.mouseLeave(getByDataId());
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('test')).not.toHaveClass('__floater__open');

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `event` hover and `eventDelay` set to 0', () => {
    beforeAll(() => {
      view = setup({
        ...props,
        event: 'hover',
        eventDelay: 0,
      });
    });

    afterAll(unmountView);

    it('should be able to show the floater', async () => {
      await act(async () => {
        fireEvent.mouseEnter(getByDataId());
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should have close itself immediately', async () => {
      await act(async () => {
        fireEvent.mouseLeave(getByDataId());
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `title`, `footer` and `closeBtn`', () => {
    beforeAll(async () => {
      await act(async () => {
        view = setup({
          ...props,
          footer: 'Footer',
          showCloseButton: true,
          title: 'Title',
        });
      });
    });

    afterAll(unmountView);

    it('should render the floater', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
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

    beforeAll(() => {
      view = setup(localProps);
    });

    afterAll(unmountView);

    it('should not be able to show the floater with click', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      expect(screen.queryByTestId('test')).not.toBeInTheDocument();
    });

    it('should not be able to show the floater with hover', async () => {
      view = setup({ ...localProps, event: 'hover' });

      await act(async () => {
        fireEvent.mouseEnter(getByDataId());
      });

      expect(screen.queryByTestId('test')).not.toBeInTheDocument();
    });

    it('should show the floater when `open` is true', async () => {
      await act(async () => {
        view.rerender(
          <ReactFloater {...localProps} open>
            {content}
          </ReactFloater>,
        );
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('test')).toHaveClass('__floater__open');
    });

    it('should close the floater when `open` is false', async () => {
      await act(async () => {
        view.rerender(
          <ReactFloater {...localProps} open={false}>
            {content}
          </ReactFloater>,
        );
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.queryByTestId('test')).not.toBeInTheDocument();
    });
  });

  describe('with `component` as function', () => {
    beforeAll(() => {
      view = setup(
        {
          ...props,
          content: undefined,
          component: Styled,
        },
        <Button />,
      );
    });

    afterAll(unmountView);

    it('should show the floater with click', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });

    it('should close the floater with `closeFn` prop', async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /close/i }));
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `component` as element', () => {
    beforeAll(() => {
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
    });

    afterAll(unmountView);

    it('should show the floater with click', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });

    it('should close the floater with `closeFn` prop', async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /close/i }));
      });

      fireEvent.transitionEnd(screen.getByTestId('test'));

      expect(screen.getByTestId('react-floater-portal')).toBeEmptyDOMElement();
    });
  });

  describe('with `placement` top', () => {
    beforeAll(() => {
      view = setup({
        ...props,
        placement: 'top',
      });
    });

    afterAll(unmountView);

    it('should show the floater with click', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });
  });

  describe('with `placement` center', () => {
    beforeAll(() => {
      view = setup({
        ...props,
        placement: 'center',
      });
    });

    afterAll(unmountView);

    it('should show the floater with click', async () => {
      await act(async () => {
        fireEvent.click(getByDataId());
        jest.runOnlyPendingTimers();
      });

      expect(screen.getByTestId('test')).toMatchSnapshot();
    });
  });

  describe('with `wrapperOptions`', () => {
    beforeAll(async () => {
      await act(async () => {
        view = render(
          <>
            <span className="external" data-id="external">
              external
            </span>
            <ReactFloater
              content={
                <div style={{ fontSize: 32 }}>
                  Yeah, this is how we use to look back in the day!
                </div>
              }
              disableFlip
              event="hover"
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
      });
    });

    afterAll(unmountView);

    it('should render the element', () => {
      expect(getByDataId('external')).toBeInTheDocument();
    });

    it('should render the floater', async () => {
      await act(async () => {
        fireEvent.mouseEnter(document.querySelector('[data-id="test"]') || document);
      });

      expect(screen.getByTestId('test')).toHaveTextContent(
        'Yeah, this is how we use to look back in the day!',
      );
    });
  });
});
