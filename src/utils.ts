import * as ExecutionEnvironment from 'exenv';
import is from 'is-lite';
import { Modifiers } from 'popper.js';
import { PartialDeep } from 'type-fest';

import * as deepmerge from 'deepmerge';
import { PlainObject } from './types';

export const { canUseDOM } = ExecutionEnvironment;

export function getOptions(options?: PartialDeep<Modifiers>): Partial<Modifiers> {
  const defaultOptions = {
    flip: {
      padding: 20,
    },
    preventOverflow: {
      padding: 10,
    },
  };

  return deepmerge(defaultOptions, options || {}) as Partial<Modifiers>;
}

export function isFixed(el: HTMLElement | null): boolean {
  if (!el) {
    return false;
  }

  const { nodeName } = el;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }

  if (getComputedStyle(el).position === 'fixed') {
    return true;
  }

  return el.parentNode instanceof HTMLElement ? isFixed(el.parentNode) : false;
}

export function isMobile(): boolean {
  return 'ontouchstart' in window && /Mobi/.test(navigator.userAgent);
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
export function log({ title, data, warn = false, debug = false }: PlainObject): void {
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

export function on(
  element: HTMLElement,
  eventType: string,
  handler: EventListener,
  options: boolean | PlainObject = false,
): void {
  element.addEventListener(eventType, handler, options);
}

export function off(
  element: Element,
  eventType: string,
  handler: EventListener,
  options: boolean | PlainObject = false,
): void {
  element.removeEventListener(eventType, handler, options);
}

export function once(
  element: HTMLElement,
  eventType: string,
  handler: EventListener,
  options: boolean | PlainObject = false,
): void {
  let nextCB: EventListener;

  // eslint-disable-next-line prefer-const
  nextCB = e => {
    handler(e);
    off(element, eventType, nextCB);
  };

  on(element, eventType, nextCB, options);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}
