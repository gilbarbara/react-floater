import * as React from 'react';
import { AnyObject } from '@gilbarbara/types';
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
import { useMount, useSetState, useSingleton, useUnmount, useUpdateEffect } from './modules/hooks';
import getStyles from './modules/styles';
import { Props, State, Statuses, Styles } from './types';

function ReactFloater(props: Props): JSX.Element {
  const {
    autoOpen,
    callback,
    children,
    component,
    content,
    debug,
    disableFlip,
    disableHoverToClick,
    event,
    eventDelay,
    footer,
    getPopper,
    hideArrow,
    id,
    modifiers,
    offset,
    open,
    placement = 'bottom',
    portalElement,
    showCloseButton,
    style,
    styles,
    target,
    title,
    wrapperOptions,
  } = enhanceProps(props);

  const [state, setState] = useSetState<State>({
    currentPlacement: placement,
    positionWrapper: !!wrapperOptions?.position && !!target,
    status: STATUS.INIT,
    statusWrapper: STATUS.INIT,
  });

  const arrowRef = React.useRef<HTMLSpanElement>(null);
  const childRef = React.useRef<HTMLElement>(null);
  const eventDelayTimer = React.useRef<number>();
  const floaterRef = React.useRef<HTMLDivElement>(null);
  const internalId = React.useRef(randomId());
  const isMounted = React.useRef(false);
  const popperRef = React.useRef<Instance>();
  const stateRef = React.useRef<State>(state);
  const wrapperPopper = React.useRef<Instance>();
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const wrapperStyles = React.useRef<React.CSSProperties>({});

  const { currentPlacement, positionWrapper, status, statusWrapper } = state;

  const { changed } = useTreeChanges(state);
  const { changed: changedProps } = useTreeChanges(props);

  const updateState = React.useCallback(
    (nextState: Partial<State>, callback_?: () => void) => {
      if (isMounted.current) {
        setState(nextState);
        stateRef.current = { ...state, ...nextState };

        if (callback_) {
          callback_();
        }
      }
    },
    [setState, state],
  );

  const toggle = React.useCallback(
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

  const targetElement = React.useRef(() => {
    if (!canUseDOM) {
      return null;
    }

    if (target) {
      if (is.domElement(target)) {
        return target;
      }

      return document.querySelector(target) as HTMLElement;
    }

    return childRef.current || wrapperRef.current;
  });

  const currentDebug = React.useMemo(() => {
    return canUseDOM && (debug || !!window.ReactFloaterDebug);
  }, [debug]);

  const currentEvent = React.useMemo(() => {
    if (event === 'hover' && isMobile() && !disableHoverToClick) {
      return 'click';
    }

    return event;
  }, [disableHoverToClick, event]);

  const currentStyles = React.useMemo(() => {
    const nextStyles: Styles = getStyles(styles);
    const element = targetElement.current();

    if (positionWrapper) {
      let wrapperCurrentStyles: AnyObject | undefined;

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

    /* istanbul ignore else */
    if (element) {
      const targetStyles = window.getComputedStyle(element);

      /* istanbul ignore else */
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
              wrapperStyles.current[d] = targetStyles[d] as React.CSSProperties['position'];
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

    return nextStyles as Styles;
  }, [positionWrapper, status, statusWrapper, styles]);

  const cleanUp = React.useRef(() => {
    if (popperRef.current) {
      popperRef.current.destroy();
      popperRef.current = undefined;
    }

    if (wrapperPopper.current) {
      wrapperPopper.current.destroy();
      wrapperPopper.current = undefined;
    }
  });

  const initPopper = React.useRef(() => {
    const nextStatus = stateRef.current.status === STATUS.RENDER ? STATUS.OPENING : STATUS.IDLE;
    const element = targetElement.current();

    /* istanbul ignore else */
    if (placement === 'center') {
      setTimeout(() => {
        updateState({ status: nextStatus });
      }, 100);
    } else if (element) {
      if (floaterRef.current) {
        const { arrow, flip, offset: offsetModifier, ...rest } = getModifiers(modifiers);

        popperRef.current = createPopper(element, floaterRef.current, {
          placement,
          strategy: isFixed(childRef.current) ? 'fixed' : 'absolute',
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
              fn: ({ instance, state: popperState }: ModifierArguments<AnyObject>) => {
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
              fn: ({ state: popperState }: ModifierArguments<AnyObject>) => {
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
    }

    if (
      element &&
      !wrapperPopper.current &&
      stateRef.current.positionWrapper &&
      wrapperRef.current &&
      placement !== 'center'
    ) {
      const wrapperOffset = wrapperOptions?.offset ? wrapperOptions.offset : 0;

      wrapperPopper.current = createPopper(element, wrapperRef.current, {
        placement: wrapperOptions?.placement || placement,
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
  });

  const handleLoad = React.useRef(() => {
    if (popperRef.current) {
      popperRef.current.forceUpdate();
    }

    if (wrapperPopper.current) {
      wrapperPopper.current.forceUpdate();
    }
  });

  const handleTransitionEnd = React.useRef(() => {
    /* istanbul ignore else */
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
  });

  const handleClick = React.useCallback(() => {
    if (is.boolean(open)) {
      return;
    }

    /* istanbul ignore else */
    if (currentEvent === 'click' || (currentEvent === 'hover' && positionWrapper)) {
      log({
        title: 'click',
        data: [{ event, status: status === STATUS.OPEN ? 'closing' : 'opening' }],
        debug: currentDebug,
      });

      toggle(status === 'idle' ? STATUS.RENDER : undefined);
    }
  }, [currentDebug, currentEvent, event, open, positionWrapper, status, toggle]);

  const handleMouseEnter = React.useCallback(() => {
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

  const handleMouseLeave = React.useCallback(() => {
    if (is.boolean(open) || isMobile()) {
      return;
    }

    /* istanbul ignore else */
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

  useSingleton(() => {
    if (canUseDOM) {
      window.addEventListener('load', handleLoad.current);
    }
  });

  useMount(() => {
    isMounted.current = true;

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

    initPopper.current();
  });

  useUnmount(() => {
    isMounted.current = false;

    cleanUp.current();
    window.removeEventListener('load', handleLoad.current);
  });

  // handle changes
  useUpdateEffect(() => {
    if (!canUseDOM) {
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

      initPopper.current();
    }

    if (floaterRef.current && changed('status', [STATUS.RENDER, STATUS.CLOSING])) {
      once(floaterRef.current, 'transitionend', handleTransitionEnd.current);
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
      id={id || internalId.current}
      isControlled={is.boolean(open)}
      onClick={handleClick}
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
        placement={currentPlacement}
        portalElement={portalElement}
        target={target}
        zIndex={currentStyles.options.zIndex}
      >
        <Floater
          arrowRef={arrowRef}
          component={component}
          content={content}
          floaterRef={floaterRef}
          footer={footer}
          hideArrow={hideArrow || currentPlacement === 'center'}
          id={id || internalId.current}
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

ReactFloater.defaultProps = {
  autoOpen: false,
  debug: false,
  disableFlip: false,
  disableHoverToClick: false,
  event: 'click',
  eventDelay: 0.4,
  hideArrow: false,
  offset: 15,
  placement: 'bottom',
  showCloseButton: false,
};

export default ReactFloater;
