import { CSSProperties, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { PlainObject } from '@gilbarbara/types';
import { createPopper, Instance, ModifierArguments } from '@popperjs/core';
import is from 'is-lite';
import useTreeChanges from 'tree-changes-hook';

import Floater from './components/Floater';
import Portal from './components/Portal';
import Wrapper from './components/Wrapper';
import { POSITIONING_PROPS, STATUS } from './literals';
import {
  canUseDOM,
  enhanceProps,
  getFallbackPlacements,
  getModifiers,
  isFixed,
  isMobile,
  log,
  mergeModifier,
  once,
  randomId,
} from './modules/helpers';
import { useUpdateEffect } from './modules/hooks';
import getStyles from './modules/styles';
import { Props, State, Statuses, Styles } from './types';

export default function ReactFloater(props: Props) {
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

  const arrowRef = useRef<HTMLSpanElement>(null);
  const childRef = useRef<HTMLElement>(null);
  const eventDelayTimer = useRef<number>();
  const floaterRef = useRef<HTMLDivElement>(null);
  const internalId = useRef(randomId());
  const isMounted = useRef(false);
  const popperRef = useRef<Instance>();
  const stateRef = useRef<State>(state);
  const wrapperPopper = useRef<Instance>();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const wrapperStyles = useRef<CSSProperties>({});

  const { currentPlacement, positionWrapper, status, statusWrapper } = state;

  const { changed } = useTreeChanges(state);
  const { changed: changedProps } = useTreeChanges(props);

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

  const targetElement = useRef(() => {
    if (!canUseDOM()) {
      return null;
    }

    if (target) {
      if (is.domElement(target)) {
        return target;
      }

      return document.querySelector(target) as HTMLElement;
    }

    return childRef.current ?? wrapperRef.current;
  });

  const currentDebug = useMemo(() => {
    return canUseDOM() && (debug || !!window.ReactFloaterDebug);
  }, [debug]);

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

      if (status !== STATUS.IDLE) {
        wrapperCurrentStyles = nextStyles.wrapperPosition;
      } else if (statusWrapper === STATUS.RENDER) {
        wrapperCurrentStyles = wrapperPopper.current?.state.styles;
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
            // eslint-disable-next-line unicorn/prefer-ternary
            if (d === 'position') {
              wrapperStyles.current[d] = targetStyles[d] as CSSProperties['position'];
            } else {
              wrapperStyles.current[d] = targetStyles[d];
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
  }, [positionWrapper, status, statusWrapper, styles]);

  const initPopper = useCallback(() => {
    const nextStatus = stateRef.current.status === STATUS.RENDER ? STATUS.OPENING : STATUS.IDLE;
    const element = targetElement.current();

    if (placement === 'center') {
      setTimeout(() => {
        updateState({ status: nextStatus });
      }, 100);
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
              fn: ({ instance, state: popperState }: ModifierArguments<PlainObject>) => {
                if (popperState.placement !== stateRef.current.currentPlacement) {
                  popperRef.current = instance;
                  updateState({ currentPlacement: popperState.placement });
                }
              },
            },
            {
              name: 'applyArrowStyle',
              enabled: true,
              phase: 'write',
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
            },
            ...Object.values(rest),
          ],
          onFirstUpdate: popperState => {
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
        });

        if (getPopper && popperRef.current) {
          getPopper(popperRef.current, 'floater');
        }
      } else {
        updateState({
          status: STATUS.IDLE,
        });
      }

      if (wrapperRef.current && !wrapperPopper.current && stateRef.current.positionWrapper) {
        const wrapperOffset = wrapperOptions?.offset ?? 0;

        wrapperPopper.current = createPopper(element, wrapperRef.current, {
          placement: wrapperOptions?.placement ?? placement,
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
                wrapperPopper.current?.forceUpdate();
              });
            }
          },
        });

        if (getPopper) {
          getPopper(wrapperPopper.current, 'wrapper');
        }
      }
    }
  }, [
    disableFlip,
    getPopper,
    hideArrow,
    modifiers,
    offset,
    placement,
    updateState,
    wrapperOptions?.offset,
    wrapperOptions?.placement,
  ]);

  const handleLoad = useCallback(() => {
    if (popperRef.current) {
      popperRef.current.forceUpdate();
    }

    if (wrapperPopper.current) {
      wrapperPopper.current.forceUpdate();
    }
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (wrapperPopper.current) {
      wrapperPopper.current.forceUpdate();
    }

    updateState(
      {
        status: stateRef.current.status === STATUS.OPENING ? STATUS.OPEN : STATUS.IDLE,
      },
      () => {
        if (callback) {
          callback(stateRef.current.status === STATUS.OPEN ? 'open' : 'close', enhanceProps(props));
        }
      },
    );
  }, [updateState, callback, props]);

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

      toggle(status === 'idle' ? STATUS.RENDER : undefined);
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

  const cleanUp = useCallback(() => {
    if (popperRef.current) {
      popperRef.current.destroy();
      popperRef.current = undefined;
    }

    if (wrapperPopper.current) {
      wrapperPopper.current.destroy();
      wrapperPopper.current = undefined;
    }
  }, []);

  // Global load event listener (singleton)
  useEffect(() => {
    if (canUseDOM()) {
      window.addEventListener('load', handleLoad);
    }
  }, [handleLoad]);

  // Mount effect
  useEffect(() => {
    isMounted.current = true;
    initPopper();
  }, [initPopper]);

  // Debug logging effect
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

  // Unmount effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
      clearTimeout(eventDelayTimer.current);
      cleanUp();
      window.removeEventListener('load', handleLoad);
    };
  }, [cleanUp, handleLoad]);

  // Update state ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // handle changes
  useUpdateEffect(() => {
    if (!canUseDOM()) {
      return;
    }

    if (changedProps('open')) {
      let forceStatus;

      // always follow `open` in controlled mode
      if (is.boolean(open)) {
        forceStatus = open ? STATUS.RENDER : STATUS.CLOSING;
      }

      toggle(forceStatus);
    }

    if (changedProps('wrapperOptions.position') || changedProps('target')) {
      updateState({
        positionWrapper: !!wrapperOptions?.position && !!target,
      });
    }

    if (
      (changed('status', STATUS.IDLE) && open) ||
      (changed('status', STATUS.IDLE, STATUS.INIT) && autoOpen)
    ) {
      toggle(STATUS.RENDER);
    }

    if (changed('status', STATUS.RENDER)) {
      if (popperRef.current) {
        popperRef.current.destroy();
      }

      initPopper();
    }

    if (floaterRef.current && changed('status', [STATUS.RENDER, STATUS.CLOSING])) {
      once(floaterRef.current, 'transitionend', handleTransitionEnd);
    }

    if (changed('status', STATUS.IDLE, STATUS.CLOSING) && popperRef.current) {
      popperRef.current.destroy();
      popperRef.current = undefined;

      if (wrapperPopper.current) {
        wrapperPopper.current.forceUpdate();
      }
    }
  });

  const wrapper = (
    <Wrapper
      childRef={childRef}
      id={id ?? internalId.current}
      isControlled={is.boolean(open)}
      onClick={handleClick}
      onMount={handleWrapperMount}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      status={status}
      style={style}
      styles={currentStyles.wrapper}
      wrapperRef={wrapperRef}
    >
      {children}
    </Wrapper>
  );

  return (
    <>
      <Portal
        hasChildren={!!children}
        internalId={internalId.current}
        placement={currentPlacement}
        portalElement={portalElement}
        target={target}
        zIndex={currentStyles.options.zIndex}
      >
        <Floater
          arrow={arrowElement}
          arrowRef={arrowRef}
          component={component}
          content={content}
          floaterRef={floaterRef}
          footer={footer}
          hideArrow={hideArrow || currentPlacement === 'center'}
          id={id ?? internalId.current}
          onClick={handleClick}
          placement={currentPlacement}
          positionWrapper={positionWrapper}
          showCloseButton={showCloseButton}
          status={status}
          styles={currentStyles}
          title={title}
        />
        {positionWrapper && wrapper}
      </Portal>
      {!positionWrapper && wrapper}
    </>
  );
}

export type {
  Action,
  CustomComponentProps,
  Placement,
  PopperInstance,
  Props,
  Styles,
} from './types';
