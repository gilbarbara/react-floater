import ReactDOM from 'react-dom';
import ExecutionEnvironment from 'exenv';
import isPlainObj from 'is-plain-obj';

export const { canUseDOM } = ExecutionEnvironment;
export const isReact16 = ReactDOM.createPortal !== undefined;

export function isMobile() {
  return ('ontouchstart' in window) && /Mobi/.test(navigator.userAgent);
}

export function isNode(el) {
  if (!el || typeof el !== 'object') {
    return false;
  }

  const windowHasNode = window && typeof window.Node === 'object';

  return windowHasNode ? (el instanceof window.Node) : (typeof el.nodeType === 'number' && typeof el.nodeName === 'string');
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

/**
 * Log method calls if debug is enabled
 *
 * @private
 * @param {Object}       arg
 * @param {string}       arg.title    - The title the logger was called from
 * @param {Object|Array} [arg.data]   - The data to be logged
 * @param {boolean}      [arg.warn]  - If true, the message will be a warning
 * @param {boolean}      [arg.debug] - Nothing will be logged unless debug is true
 */
export function log({ title = 'react-tooltips', data, warn = false, debug = false }) {
  const logFn = warn ? console.warn || console.error : console.log; //eslint-disable-line no-console

  if (debug) {
    console.log(`%c${title}`, 'color: #760bc5; font-weight: bold; font-size: 12px;'); //eslint-disable-line no-console

    if (data) {
      if (Array.isArray(data)) {
        data.forEach(d => {
          if (isPlainObj(d) && d.key) {
            logFn.apply(console, [d.key, d.value]);
          }
          else {
            logFn.apply(console, [d]);
          }
        });
      }
      else {
        logFn.apply(console, [data]);
      }
    }
  }
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
