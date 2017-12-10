export function randomID() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';

  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export function isFixed(element) {
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
