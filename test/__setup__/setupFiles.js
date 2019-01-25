import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

const react = document.createElement('div');
react.id = 'react';
react.style.height = '100vh';
document.body.appendChild(react);

global.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};

global.matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
});

global.Range = function Range() {};

const createContextualFragment = html => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.children[0];
};

Range.prototype.createContextualFragment = html => createContextualFragment(html);

global.window.document.createRange = function createRange() {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => ({ right: 0 }),
    getClientRects: () => [],
    createContextualFragment,
    commonAncestorContainer: document.documentElement,
  };
};
