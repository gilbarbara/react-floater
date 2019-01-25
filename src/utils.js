// @flow
import ReactDOM from 'react-dom';
import ExecutionEnvironment from 'exenv';
import is from 'is-lite';

export const { canUseDOM } = ExecutionEnvironment;
export const isReact16 = ReactDOM.createPortal !== undefined;

export function isMobile(): boolean {
  return 'ontouchstart' in window && /Mobi/.test(navigator.userAgent);
}

export function getStyleComputedProperty(el: HTMLElement): Object {
  if (el.nodeType !== 1) {
    return {};
  }

  return getComputedStyle(el);
}

export function isFixed(el: HTMLElement): boolean {
  if (!el) {
    return false;
  }

  const { nodeName } = el;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }

  if (getStyleComputedProperty(el).position === 'fixed') {
    return true;
  }

  return el.parentNode instanceof HTMLElement ? isFixed(el.parentNode) : false;
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
export function log({ title, data, warn = false, debug = false }: Object) {
  /* eslint-disable no-console */
  const logFn = warn ? console.warn || console.error : console.log;

  if (debug && title && data) {
    console.groupCollapsed(
      `%creact-floater: ${title}`,
      'color: #9b00ff; font-weight: bold; font-size: 12px;',
    );

    if (Array.isArray(data)) {
      data.forEach(d => {
        if (is.plainObject(d) && d.key) {
          logFn.apply(console, [d.key, d.value]);
        } else {
          logFn.apply(console, [d]);
        }
      });
    } else {
      logFn.apply(console, [data]);
    }

    console.groupEnd();
  }
  /* eslint-enable */
}

export function on(element: Element, event: string, cb: Function, capture: boolean = false) {
  element.addEventListener(event, cb, capture);
}

export function off(element: Element, event: string, cb: Function, capture: boolean = false) {
  element.removeEventListener(event, cb, capture);
}

export function once(element: Element, event: string, cb: Function, capture: boolean = false) {
  let nextCB;

  // eslint-disable-next-line prefer-const
  nextCB = e => {
    cb(e);
    off(element, event, nextCB);
  };

  on(element, event, nextCB, capture);
}

export function noop() {}
