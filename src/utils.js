import ExecutionEnvironment from 'exenv';

export const { canUseDOM } = ExecutionEnvironment;

export function randomID() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

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

export const STATUS = {
  IDLE: 'idle',
  READY: 'ready',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing',
  ERROR: 'error',
};
