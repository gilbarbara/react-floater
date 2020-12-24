import { useRef } from 'react';
import * as deepmerge from 'deepmerge';
import * as ExecutionEnvironment from 'exenv';
import is from 'is-lite';

import { Modifier, Placement } from '@popperjs/core';
import { PlainObject, PopperModifiers } from './types';

export const { canUseDOM } = ExecutionEnvironment;
export const portalId = 'react-floater-portal';

export function getFallbackPlacements(placement: Placement): Placement[] | undefined {
  if (placement.startsWith('left')) {
    return ['top', 'bottom'];
  }

  if (placement.startsWith('right')) {
    return ['bottom', 'top'];
  }

  return undefined;
}

export function getModifiers(modifiers?: PopperModifiers): PopperModifiers {
  const defaultOptions = {
    flip: {
      options: {
        padding: 20,
      },
    },
    preventOverflow: {
      options: {
        padding: 10,
      },
    },
  };

  return deepmerge(defaultOptions, modifiers || {}) as PopperModifiers;
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

export function mergeModifier(
  modifier: Partial<Modifier<any, any>>,
  customModifier?: Partial<Modifier<any, any>>,
): Modifier<any, any> {
  return deepmerge(modifier, customModifier || {}, {
    arrayMerge: (_dest, source) => source,
    isMergeableObject: is.plainObject,
  });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

export function off(
  element: Element,
  eventType: string,
  handler: EventListener,
  options: boolean | PlainObject = false,
): void {
  element.removeEventListener(eventType, handler, options);
}

export function on(
  element: HTMLElement,
  eventType: string,
  handler: EventListener,
  options: boolean | PlainObject = false,
): void {
  element.addEventListener(eventType, handler, options);
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

export function useSingleton(cb: () => void): void {
  const hasBeenCalled = useRef(false);

  if (hasBeenCalled.current) {
    return;
  }

  cb();
  hasBeenCalled.current = true;
}

export function wait(cb: () => void, amount = 1): number {
  return window.setTimeout(cb, amount);
}
