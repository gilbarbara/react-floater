/**
 * @vitest-environment node
 */

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import ReactFloater from '../src';

describe('without dom', () => {
  it('should render', () => {
    const view = renderToStaticMarkup(
      <ReactFloater content="Hello! This is my content!" id="r1tc2">
        Hey
      </ReactFloater>,
    );

    expect(view).toMatchSnapshot();
  });
});
