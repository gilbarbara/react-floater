import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { noop } from '../../src/utils';

Enzyme.configure({ adapter: new Adapter() });

declare let window: any;

const react = document.createElement('div');
react.id = 'react';
react.style.height = '100vh';
document.body.appendChild(react);

window.requestAnimationFrame = (callback: any) => {
  setTimeout(callback, 0);
};

window.matchMedia = () => ({
  matches: false,
  addListener: noop,
  removeListener: noop,
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
window.Range = function Range() {};

const createContextualFragment = (html: string): DocumentFragment => {
  const div = document.createElement('div');
  div.innerHTML = html;

  // @ts-ignore
  return div.children[0];
};

Range.prototype.createContextualFragment = (html: string) => createContextualFragment(html);

window.document.createRange = function createRange() {
  return {
    setEnd: noop,
    setStart: noop,
    getBoundingClientRect: () => ({ right: 0 }),
    getClientRects: () => [],
    createContextualFragment,
    commonAncestorContainer: document.documentElement,
  };
};
