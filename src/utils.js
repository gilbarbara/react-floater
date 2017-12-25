import ExecutionEnvironment from 'exenv';
import ReactDOM from 'react-dom';

export const { canUseDOM } = ExecutionEnvironment;

export const isReact16 = ReactDOM.createPortal !== undefined;

export function isMobile() {
  return ('ontouchstart' in window) && /Mobi/.test(navigator.userAgent);
}

export function isNode(el) {
  if (!el || typeof el !== 'object') {
    return false;
  }

  return (window && typeof window.Node === 'object')
    ? (el instanceof window.Node)
    : (typeof el.nodeType === 'number' && typeof el.nodeName === 'string');
}

export function isFixed(element) {
  if (!element) {
    return false;
  }

  const { nodeName } = element;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getComputedStyle(element).position === 'fixed') {
    return true;
  }

  return isFixed(element.parentNode);
}

export function on(element, event, cb, capture = false) {
  element.addEventListener(event, cb, capture);
}

export function off(element, event, cb, capture = false) {
  element.removeEventListener(event, cb, capture);
}

export function once(element, event, cb, capture = false) {
  let nextCB;

  nextCB = e => { //eslint-disable-line prefer-const
    cb(e);
    off(element, event, nextCB);
  };

  on(element, event, nextCB, capture);
}
