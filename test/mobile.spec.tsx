/* eslint-disable testing-library/no-manual-cleanup */
import { act, cleanup, configure, fireEvent, render, screen } from '@testing-library/react';

import ReactFloater from '../src';
import * as helpers from '../src/modules/helpers';
import { Props } from '../src/types';

configure({
  testIdAttribute: 'id',
});

vi.useFakeTimers();

const id = 'test';
const idWrapper = `${id}-wrapper`;
const content = 'Hello! This is my content!';

const props: Props = {
  id,
  content,
  event: 'hover',
};

describe('ReactFloater with isMobile', () => {
  beforeEach(() => {
    vi.spyOn(helpers, 'isMobile').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should not open the floater on mouseEnter', () => {
    render(<ReactFloater {...props}>Places</ReactFloater>);

    fireEvent.mouseEnter(screen.getByTestId(idWrapper));

    const portal = document.getElementById('react-floater-portal');

    expect(portal).toBeEmptyDOMElement();
  });

  it('should not close the floater on mouseLeave', async () => {
    render(
      <ReactFloater {...props} event="click">
        Places
      </ReactFloater>,
    );

    // Open via click
    fireEvent.click(screen.getByTestId(idWrapper));

    // Flush Popper.js async onFirstUpdate (sets status to OPENING)
    await act(async () => undefined);

    fireEvent.transitionEnd(screen.getByTestId(id));

    expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');

    // mouseLeave should be a no-op on mobile
    fireEvent.mouseLeave(screen.getByTestId(idWrapper));

    expect(screen.getByTestId(id).firstChild).toHaveClass('__floater__open');
  });
});
