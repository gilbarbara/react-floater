import { CSSProperties, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { PlainObject } from '@gilbarbara/types';
import { createPopper, Instance, ModifierArguments } from '@popperjs/core';
import is from 'is-lite';

import { POSITIONING_PROPS, STATUS } from '../literals';
import { Props, State, Statuses, Styles } from '../types';

import {
  enhanceProps,
  getFallbackPlacements,
  getModifiers,
  isFixed,
  isMobile,
  log,
  mergeModifier,
  once,
  randomId,
} from './helpers';
import { useUpdateEffect } from './hooks';
import getStyles from './styles';

export function useFloater(props: Props) {
  const {
    arrow: arrowElement,
    autoOpen = false,
    callback,
    children,
    component,
    content,
    debug = false,
    disableFlip = false,
    disableHoverToClick = false,
    event = 'click',
    eventDelay = 0.4,
    footer,
    getPopper,
    hideArrow = false,
    id,
    modifiers,
    offset = 15,
    open,
    placement = 'bottom',
    portalElement,
    showCloseButton = false,
    style,
    styles,
    target,
    title,
    wrapperOptions,
  } = enhanceProps(props);

  const [state, setState] = useReducer(
    (previousState: State, nextState: Partial<State>) => ({
      ...previousState,
      ...nextState,
    }),
    {
      currentPlacement: placement,
      positionWrapper: !!wrapperOptions?.position && !!target,
      status: STATUS.INIT,
      statusWrapper: STATUS.INIT,
    },
  );

  const { currentPlacement, positionWrapper, status, statusWrapper } = state;

  // ------------------
  // Refs
  // ------------------

  // DOM
  const arrowRef = useRef<HTMLSpanElement>(null);
  const childRef = useRef<HTMLElement>(null);
  const floaterRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Internal
  const eventDelayTimer = useRef<number>(undefined);
  const internalId = useRef(randomId());
  const isMounted = useRef(false);
  const popperGeneration = useRef(0);
  const popperRef = useRef<Instance>(undefined);
  const previousStatus = useRef<Statuses>(STATUS.INIT);
  const stateRef = useRef<State>(state);
  const removeTransitionListener = useRef<(() => void) | undefined>(undefined);
  const wrapperPopperRef = useRef<Instance>(undefined);
  const wrapperStyles = useRef<CSSProperties>(undefined);

  // Callback refs (updated each render to keep closures fresh)
  const callbackRef = useRef(callback);
  const getPopperRef = useRef(getPopper);
  const initPopperRef = useRef<() => void>(undefined!);
  const propsRef = useRef(props);
  const targetElement = useRef<() => HTMLElement | null>(undefined!);

  // ------------------
  // Ref updates
  // ------------------

  callbackRef.current = callback;
  getPopperRef.current = getPopper;
  propsRef.current = props;

  targetElement.current = () => {
    if (target) {
      if (is.domElement(target)) {
        return target;
      }

      return document.querySelector(target) as HTMLElement;
    }

    return childRef.current ?? wrapperRef.current;
  };

  // ------------------
  // Derived values
  // ------------------

  const currentDebug = debug || !!window.ReactFloaterDebug;
  const isIdle = status === STATUS.IDLE;

  const currentEvent = useMemo(() => {
    if (event === 'hover' && isMobile() && !disableHoverToClick) {
      return 'click';
    }

    return event;
  }, [disableHoverToClick, event]);

  const currentStyles = useMemo(() => {
    const nextStyles: Styles = getStyles(styles);
    const element = targetElement.current();

    if (positionWrapper) {
      let wrapperCurrentStyles: CSSProperties | undefined;

      if (!isIdle) {
        wrapperCurrentStyles = nextStyles.wrapperPosition;
      } else if (statusWrapper === STATUS.RENDER) {
        wrapperCurrentStyles = wrapperPopperRef.current?.state.styles;
      }

      nextStyles.wrapper = {
        ...nextStyles.wrapper,
        ...wrapperCurrentStyles,
      };
    }

    if (element) {
      const targetStyles = window.getComputedStyle(element);

      if (wrapperStyles.current) {
        nextStyles.wrapper = {
          ...nextStyles.wrapper,
          ...wrapperStyles.current,
        };
      } else if (!['relative', 'static'].includes(targetStyles.position)) {
        wrapperStyles.current = {};

        if (!positionWrapper) {
          POSITIONING_PROPS.forEach(d => {
            if (d === 'position') {
              wrapperStyles.current![d] = targetStyles[d] as CSSProperties['position'];
            } else {
              wrapperStyles.current![d] = targetStyles[d];
            }
          });

          nextStyles.wrapper = {
            ...nextStyles.wrapper,
            ...wrapperStyles.current,
          };
        }
      }
    }

    return nextStyles;
  }, [positionWrapper, isIdle, statusWrapper, styles]);

  // ------------------
  // Core functions
  // ------------------

  const updateState = useCallback((nextState: Partial<State>, callback_?: () => void) => {
    if (isMounted.current) {
      setState(nextState);
      stateRef.current = { ...stateRef.current, ...nextState };

      if (callback_) {
        callback_();
      }
    }
  }, []);

  const toggle = useCallback(
    (forceStatus?: Statuses) => {
      let nextStatus: Statuses =
        stateRef.current.status === STATUS.OPEN ? STATUS.CLOSING : STATUS.RENDER;

      if (!is.undefined(forceStatus)) {
        nextStatus = forceStatus;
      }

      updateState({
        status: nextStatus,
        statusWrapper: nextStatus === STATUS.CLOSING ? STATUS.RENDER : STATUS.IDLE,
      });
    },
    [updateState],
  );

  const initPopper = useCallback(() => {
    const nextStatus = stateRef.current.status === STATUS.RENDER ? STATUS.OPENING : STATUS.IDLE;

    popperGeneration.current++;
    const generation = popperGeneration.current;
    const element = targetElement.current();

    if (placement === 'center') {
      requestAnimationFrame(() => {
        if (popperGeneration.current !== generation) return;

        updateState({ status: nextStatus });
      });
    } else if (element) {
      if (floaterRef.current) {
        const { arrow, flip, offset: offsetModifier, ...rest } = getModifiers(modifiers);

        popperRef.current = createPopper(element, floaterRef.current, {
          placement,
          strategy: isFixed(targetElement.current()) ? 'fixed' : 'absolute',
          modifiers: [
            mergeModifier(
              {
                name: 'arrow',
                enabled: !hideArrow,
                options: {
                  element: arrowRef.current,
                  padding: 8,
                },
              },
              arrow,
            ),
            mergeModifier(
              {
                name: 'flip',
                enabled: !disableFlip,
                options: {
                  altAxis: false,
                  fallbackPlacements: getFallbackPlacements(placement || 'bottom'),
                },
              },
              flip,
            ),
            mergeModifier(
              {
                name: 'offset',
                enabled: true,
                options: {
                  offset: [0, offset],
                },
              },
              offsetModifier,
            ),
            {
              name: 'updatePlacement',
              enabled: true,
              phase: 'afterWrite',
              /* v8 ignore start -- @preserve */
              fn: ({ instance, state: popperState }: ModifierArguments<PlainObject>) => {
                if (popperState.placement !== stateRef.current.currentPlacement) {
                  popperRef.current = instance;
                  updateState({ currentPlacement: popperState.placement });
                }
              },
              /* v8 ignore stop -- @preserve */
            },
            {
              name: 'applyArrowStyle',
              enabled: true,
              phase: 'write',
              /* v8 ignore start -- @preserve */
              fn: ({ state: popperState }: ModifierArguments<PlainObject>) => {
                const {
                  elements: { arrow: stateArrow },
                  placement: statePlacement,
                } = popperState;

                if (stateArrow) {
                  if (statePlacement.startsWith('top')) {
                    stateArrow.style.bottom = '0px';
                    stateArrow.style.right = '';
                  } else if (statePlacement.startsWith('bottom')) {
                    stateArrow.style.top = '0px';
                    stateArrow.style.right = '';
                  } else if (statePlacement.startsWith('left')) {
                    stateArrow.style.right = '0px';
                    stateArrow.style.bottom = '';
                  } else if (statePlacement.startsWith('right')) {
                    stateArrow.style.left = '0px';
                    stateArrow.style.bottom = '';
                  }
                }
              },
              /* v8 ignore stop -- @preserve */
            },
            ...Object.values(rest),
          ],
          /* v8 ignore start -- @preserve */
          onFirstUpdate: popperState => {
            if (popperGeneration.current !== generation) return;

            updateState({
              currentPlacement: popperState.placement,
              status: nextStatus,
            });

            if (placement !== popperState.placement) {
              setTimeout(() => {
                popperRef.current?.forceUpdate();
              });
            }
          },
          /* v8 ignore stop -- @preserve */
        });

        if (getPopperRef.current && popperRef.current) {
          getPopperRef.current(popperRef.current, 'floater');
        }
      } else if (stateRef.current.status === STATUS.RENDER) {
        /* v8 ignore start -- @preserve */
        requestAnimationFrame(() => {
          if (isMounted.current && stateRef.current.status === STATUS.RENDER) {
            initPopper();
          }
        });
        /* v8 ignore stop -- @preserve */
      } else {
        /* v8 ignore next 3 -- @preserve */
        updateState({
          status: STATUS.IDLE,
        });
      }

      /* v8 ignore start -- @preserve */
      if (wrapperRef.current && !wrapperPopperRef.current && stateRef.current.positionWrapper) {
        const wrapperOffset = wrapperOptions?.offset ?? 0;

        wrapperPopperRef.current = createPopper(element, wrapperRef.current, {
          placement: wrapperOptions?.placement ?? placement,
          strategy: isFixed(targetElement.current()) ? 'fixed' : 'absolute',
          modifiers: [
            {
              name: 'arrow',
              enabled: false,
            },
            {
              name: 'offset',
              options: {
                offset: [0, wrapperOffset],
              },
            },
            {
              name: 'flip',
              enabled: false,
            },
          ],
          onFirstUpdate: popperState => {
            updateState({ statusWrapper: STATUS.RENDER });

            if (placement !== popperState.placement) {
              setTimeout(() => {
                wrapperPopperRef.current?.forceUpdate();
              });
            }
          },
        });

        if (getPopperRef.current) {
          getPopperRef.current(wrapperPopperRef.current, 'wrapper');
        }
      }
      /* v8 ignore stop -- @preserve */
    }
  }, [
    disableFlip,
    hideArrow,
    modifiers,
    offset,
    placement,
    updateState,
    wrapperOptions?.offset,
    wrapperOptions?.placement,
  ]);

  const cleanUp = useCallback(() => {
    if (popperRef.current) {
      popperRef.current.destroy();
      popperRef.current = undefined;
    }

    if (wrapperPopperRef.current) {
      wrapperPopperRef.current.destroy();
      wrapperPopperRef.current = undefined;
    }
  }, []);

  initPopperRef.current = initPopper;

  // ------------------
  // Event handlers
  // ------------------

  const handleTransitionEnd = useCallback(() => {
    /* v8 ignore next 3 -- @preserve */
    if (wrapperPopperRef.current) {
      wrapperPopperRef.current.forceUpdate();
    }

    updateState(
      {
        status: stateRef.current.status === STATUS.OPENING ? STATUS.OPEN : STATUS.IDLE,
      },
      () => {
        if (callbackRef.current) {
          callbackRef.current(
            stateRef.current.status === STATUS.OPEN ? 'open' : 'close',
            enhanceProps(propsRef.current),
          );
        }
      },
    );
  }, [updateState]);

  const handleClick = useCallback(() => {
    if (is.boolean(open)) {
      return;
    }

    if (currentEvent === 'click' || (currentEvent === 'hover' && positionWrapper)) {
      log({
        title: 'click',
        data: [{ event, status: status === STATUS.OPEN ? 'closing' : 'opening' }],
        debug: currentDebug,
      });

      toggle(status === STATUS.IDLE ? STATUS.RENDER : undefined);
    }
  }, [currentDebug, currentEvent, event, open, positionWrapper, status, toggle]);

  const handleMouseEnter = useCallback(() => {
    if (is.boolean(open) || isMobile() || currentEvent !== 'hover') {
      return;
    }

    log({
      title: 'mouseEnter',
      data: [{ key: 'originalEvent', value: event }],
      debug: currentDebug,
    });

    if (status === STATUS.IDLE) {
      clearTimeout(eventDelayTimer.current);
      eventDelayTimer.current = undefined;
      toggle(STATUS.RENDER);
    }
  }, [currentDebug, currentEvent, event, open, status, toggle]);

  const handleMouseLeave = useCallback(() => {
    if (is.boolean(open) || isMobile()) {
      return;
    }

    if (currentEvent === 'hover') {
      log({
        title: 'mouseLeave',
        data: [{ key: 'originalEvent', value: event }],
        debug: currentDebug,
      });

      const hasOpenStatus = ([STATUS.OPENING, STATUS.OPEN] as Statuses[]).includes(status);

      if (!eventDelay) {
        toggle(status === STATUS.CLOSING ? STATUS.IDLE : STATUS.CLOSING);
      } else if (!positionWrapper) {
        if (hasOpenStatus) {
          clearTimeout(eventDelayTimer.current);
          eventDelayTimer.current = window.setTimeout(() => {
            toggle();
            eventDelayTimer.current = undefined;
          }, eventDelay * 1000);
        }
      }
    }
  }, [currentDebug, currentEvent, event, eventDelay, open, positionWrapper, status, toggle]);

  const handleWrapperMount = useCallback(() => {
    if (positionWrapper) {
      initPopper();
    }
  }, [initPopper, positionWrapper]);

  // ------------------
  // Effects
  // ------------------

  // Mount
  useEffect(() => {
    isMounted.current = true;
    initPopperRef.current();
  }, []);

  // Debug log
  useEffect(() => {
    log({
      title: 'init',
      data: {
        hasChildren: !!children,
        hasTarget: !!target,
        isControlled: is.boolean(open),
        positionWrapper,
        target: targetElement.current(),
        floater: floaterRef.current,
      },
      debug: currentDebug,
    });
  }, [children, target, open, positionWrapper, currentDebug]);

  // Unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      clearTimeout(eventDelayTimer.current);
      removeTransitionListener.current?.();
      cleanUp();
    };
  }, [cleanUp]);

  // Controlled mode: respond to `open` prop changes (skips first render)
  useUpdateEffect(() => {
    if (is.boolean(open)) {
      const forceStatus = open ? STATUS.RENDER : STATUS.CLOSING;

      toggle(forceStatus);
    }
  }, [open, toggle]);

  // Sync positionWrapper when wrapperOptions.position or target changes
  useEffect(() => {
    const next = !!wrapperOptions?.position && !!target;

    if (stateRef.current.positionWrapper !== next) {
      updateState({ positionWrapper: next });
    }
  }, [wrapperOptions?.position, target, updateState]);

  // Status transitions
  useEffect(() => {
    if (status === previousStatus.current) {
      return;
    }

    if (status === STATUS.IDLE && previousStatus.current !== STATUS.IDLE) {
      if (open || (previousStatus.current === STATUS.INIT && autoOpen)) {
        toggle(STATUS.RENDER);
      }
    }

    if (status === STATUS.RENDER && previousStatus.current !== STATUS.RENDER) {
      if (popperRef.current) {
        popperRef.current.destroy();
      }

      initPopper();
    }

    if (
      floaterRef.current &&
      (status === STATUS.RENDER || status === STATUS.CLOSING) &&
      previousStatus.current !== status
    ) {
      removeTransitionListener.current?.();
      removeTransitionListener.current = once(
        floaterRef.current,
        'transitionend',
        handleTransitionEnd,
      );
    }

    if (status === STATUS.IDLE && previousStatus.current === STATUS.CLOSING) {
      if (popperRef.current) {
        popperRef.current.destroy();
        popperRef.current = undefined;
      }

      /* v8 ignore next 3 -- @preserve */
      if (wrapperPopperRef.current) {
        wrapperPopperRef.current.forceUpdate();
      }
    }

    previousStatus.current = status;
  }, [autoOpen, handleTransitionEnd, initPopper, open, status, toggle]);

  return {
    // Refs
    arrowRef,
    childRef,
    floaterRef,
    wrapperRef,

    // State
    currentPlacement,
    positionWrapper,
    status,

    // Computed
    currentStyles,
    internalId: internalId.current,

    // Enhanced props needed by JSX
    arrowElement,
    children,
    component,
    content,
    footer,
    hideArrow,
    id,
    open,
    portalElement,
    showCloseButton,
    style,
    target,
    title,

    // Handlers
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleWrapperMount,
  };
}
