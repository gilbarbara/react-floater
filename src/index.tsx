import * as React from 'react';
import { createPopper, ModifierArguments, Instance } from '@popperjs/core';
import is from 'is-lite';
import treeChanges from 'tree-changes';

import { POSITIONING_PROPS, STATUS } from './literals';
import {
  canUseDOM,
  getFallbackPlacements,
  getModifiers,
  isFixed,
  isMobile,
  log,
  mergeModifier,
  once,
  randomId,
  wait,
} from './utils';

import { PlainObject, Props, State, Statuses, Styles } from './types';

import Portal from './components/Portal';
import Floater from './components/Floater';
import Wrapper from './components/Wrapper';

import getStyles from './styles';

export default class ReactFloater extends React.PureComponent<Props, State> {
  arrowRef = React.createRef<HTMLSpanElement>();
  cachedStyles?: Styles;
  childRef = React.createRef<HTMLElement>();
  eventDelayTimer?: number;
  floaterRef = React.createRef<HTMLDivElement>();
  id = randomId();
  isActive = false;
  popper?: Instance;
  wrapperPopper?: Instance;
  wrapperRef = React.createRef<HTMLSpanElement>();
  wrapperStyles: React.CSSProperties = {};

  constructor(props: Props) {
    super(props);
    const { children, placement, open, target, wrapperOptions } = this.props;

    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      if (wrapperOptions?.position && !target) {
        console.warn('Missing props! You need to set a `target` to use `wrapperOptions.position`'); // eslint-disable-line no-console
      }

      if (!children && !is.boolean(open)) {
        console.warn('Missing props! You need to set `children`.'); // eslint-disable-line no-console
      }
    }

    this.state = {
      currentPlacement: placement || 'bottom',
      positionWrapper: !!wrapperOptions?.position && !!target,
      status: STATUS.INIT,
      statusWrapper: STATUS.INIT,
    };

    if (canUseDOM) {
      window.addEventListener('load', this.handleLoad);
    }
  }

  static defaultProps = {
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
    styles: {},
    target: null,
    wrapperOptions: {
      position: false,
    },
  };

  componentDidMount(): void {
    if (!canUseDOM) return;

    const { positionWrapper } = this.state;
    const { children, open, target } = this.props;

    this.isActive = true;

    log({
      title: 'init',
      data: {
        hasChildren: !!children,
        hasTarget: !!target,
        isControlled: is.boolean(open),
        positionWrapper,
        target: this.target,
        floater: this.floaterRef,
      },
      debug: this.debug,
    });

    this.initPopper();
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (!canUseDOM) return;

    const { autoOpen, open } = this.props;
    const { changedFrom, changed } = treeChanges(prevState, this.state);
    const { changed: changedProps } = treeChanges(prevProps, this.props);

    if (changedProps('open')) {
      let forceStatus;

      // always follow `open` in controlled mode
      if (is.boolean(open)) {
        forceStatus = open ? STATUS.RENDER : STATUS.CLOSING;
      }

      this.toggle(forceStatus);
    }

    if (changedProps('wrapperOptions.position') || changedProps('target')) {
      this.changeWrapperPosition(this.props);
    }

    if (changedProps('styles') || changed('status') || changed('statusWrapper')) {
      this.cachedStyles = undefined;
    }

    if (
      (changed('status', STATUS.IDLE) && open) ||
      (changedFrom('status', STATUS.INIT, STATUS.IDLE) && autoOpen)
    ) {
      this.toggle(STATUS.RENDER);
    }

    if (changed('status', STATUS.RENDER)) {
      if (this.popper) {
        this.popper.forceUpdate();
      } else {
        this.initPopper();
      }
    }

    if (this.floaterRef.current && changed('status', [STATUS.RENDER, STATUS.CLOSING])) {
      once(this.floaterRef.current, 'transitionend', this.handleTransitionEnd);
    }

    if (changedFrom('status', STATUS.CLOSING, STATUS.IDLE) && this.popper) {
      this.popper.destroy();
      this.popper = undefined;

      if (this.wrapperPopper) {
        this.wrapperPopper.forceUpdate();
      }
    }
  }

  componentWillUnmount(): void {
    if (!canUseDOM) return;

    this.isActive = false;

    if (this.popper) {
      this.popper.destroy();
    }

    if (this.wrapperPopper) {
      this.wrapperPopper.destroy();
    }

    window.removeEventListener('load', this.handleLoad);
  }

  private initPopper() {
    const { positionWrapper, status } = this.state;
    const {
      disableFlip,
      getPopper,
      hideArrow,
      offset,
      modifiers,
      placement,
      wrapperOptions,
    } = this.props;
    const nextStatus = status === STATUS.RENDER ? STATUS.OPENING : STATUS.IDLE;

    /* istanbul ignore else */
    if (placement === 'center') {
      wait(() => {
        this.updateState({ status: nextStatus });
      }, 100);
    } else if (this.target) {
      if (this.floaterRef.current) {
        const { arrow, flip, offset: offsetModifier, ...rest } = getModifiers(modifiers);

        this.popper = createPopper(this.target, this.floaterRef.current, {
          placement,
          strategy: isFixed(this.childRef.current) ? 'fixed' : 'absolute',
          modifiers: [
            mergeModifier(
              {
                name: 'arrow',
                enabled: !hideArrow,
                options: {
                  element: this.arrowRef.current,
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
              fn: ({ instance, state }: ModifierArguments<PlainObject>) => {
                const { currentPlacement } = this.state;

                if (state.placement !== currentPlacement) {
                  this.popper = instance;
                  this.updateState({ currentPlacement: state.placement });
                }
              },
            },
            {
              name: 'applyArrowStyle',
              enabled: true,
              phase: 'write',
              fn: ({ state }: ModifierArguments<PlainObject>) => {
                const {
                  placement: statePlacement,
                  elements: { arrow: stateArrow },
                } = state;

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
            ...(rest ? Object.values(rest) : []),
          ],
          onFirstUpdate: state => {
            this.updateState({
              currentPlacement: state.placement,
              status: nextStatus,
            });

            if (placement !== state.placement) {
              wait(() => {
                this.popper?.forceUpdate();
              });
            }
          },
        });

        if (getPopper) {
          getPopper(this.popper, 'floater');
        }
      } else {
        this.updateState({
          status: STATUS.IDLE,
        });
      }
    }

    if (
      !this.wrapperPopper &&
      positionWrapper &&
      this.target &&
      this.wrapperRef.current &&
      placement !== 'center'
    ) {
      const wrapperOffset = wrapperOptions?.offset ? wrapperOptions.offset : 0;

      this.wrapperPopper = createPopper(this.target, this.wrapperRef.current, {
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
        onFirstUpdate: state => {
          this.updateState({ statusWrapper: STATUS.RENDER });

          if (placement !== state.placement) {
            wait(() => {
              this.wrapperPopper?.forceUpdate();
            });
          }
        },
      });

      if (getPopper) {
        getPopper(this.wrapperPopper, 'wrapper');
      }
    }
  }

  private changeWrapperPosition({ target, wrapperOptions }: Props) {
    this.updateState({
      positionWrapper: !!wrapperOptions?.position && !!target,
    });
  }

  private toggle(forceStatus?: Statuses) {
    const { status } = this.state;
    let nextStatus: Statuses = status === STATUS.OPEN ? STATUS.CLOSING : STATUS.RENDER;

    if (!is.undefined(forceStatus)) {
      nextStatus = forceStatus;
    }

    this.updateState({
      status: nextStatus,
      statusWrapper: nextStatus === STATUS.CLOSING ? STATUS.RENDER : STATUS.IDLE,
    });
  }

  private updateState(nextState: Partial<State>, callback?: () => void) {
    if (this.isActive) {
      this.setState(nextState as State, callback);
    }
  }

  private handleClick = () => {
    const { positionWrapper, status } = this.state;
    const { event, open } = this.props;

    if (is.boolean(open)) return;

    /* istanbul ignore else */
    if (this.event === 'click' || (this.event === 'hover' && positionWrapper)) {
      log({
        title: 'click',
        data: [{ event, status: status === STATUS.OPEN ? 'closing' : 'opening' }],
        debug: this.debug,
      });

      this.toggle(status === 'idle' ? STATUS.RENDER : undefined);
    }
  };

  private handleLoad = () => {
    if (this.popper) {
      this.popper.forceUpdate();
    }

    if (this.wrapperPopper) {
      this.wrapperPopper.forceUpdate();
    }
  };

  private handleMouseEnter = () => {
    const { status } = this.state;
    const { event, open } = this.props;

    if (is.boolean(open) || isMobile()) return;

    /* istanbul ignore else */
    if (this.event === 'hover' && status === STATUS.IDLE) {
      log({
        title: 'mouseEnter',
        data: [{ key: 'originalEvent', value: event }],
        debug: this.debug,
      });

      clearTimeout(this.eventDelayTimer);
      this.toggle(status === 'idle' ? STATUS.RENDER : undefined);
    }
  };

  private handleMouseLeave = () => {
    const { event, eventDelay, open } = this.props;
    const { positionWrapper, status } = this.state;

    if (is.boolean(open) || isMobile()) return;

    /* istanbul ignore else */
    if (this.event === 'hover') {
      log({
        title: 'mouseLeave',
        data: [{ key: 'originalEvent', value: event }],
        debug: this.debug,
      });

      const hasOpenStatus = status === STATUS.OPENING || status === STATUS.OPEN;

      if (!eventDelay) {
        this.toggle(STATUS.CLOSING);
      } else if (hasOpenStatus && !positionWrapper && !this.eventDelayTimer) {
        this.eventDelayTimer = window.setTimeout(() => {
          delete this.eventDelayTimer;

          this.toggle();
        }, eventDelay * 1000);
      }
    }
  };

  private handleTransitionEnd = () => {
    const { status } = this.state;
    const { callback } = this.props;

    /* istanbul ignore else */
    if (this.wrapperPopper) {
      this.wrapperPopper.forceUpdate();
    }

    this.updateState(
      {
        status: status === STATUS.OPENING ? STATUS.OPEN : STATUS.IDLE,
      },
      () => {
        const { status: newStatus } = this.state;
        if (callback) {
          callback(newStatus === STATUS.OPEN ? 'open' : 'close', this.props);
        }
      },
    );
  };

  private get debug() {
    const { debug } = this.props;

    return debug || canUseDOM ? !!window.ReactFloaterDebug : false;
  }

  private get event() {
    const { disableHoverToClick, event } = this.props;

    if (event === 'hover' && isMobile() && !disableHoverToClick) {
      return 'click';
    }

    return event;
  }

  private get styles() {
    if (!this.cachedStyles) {
      const { status, positionWrapper, statusWrapper } = this.state;
      const { styles } = this.props;

      const nextStyles: Styles = getStyles(styles);

      if (positionWrapper) {
        let wrapperStyles: PlainObject | undefined;

        if (status !== STATUS.IDLE) {
          wrapperStyles = nextStyles.wrapperPosition;
        } else if (statusWrapper === STATUS.RENDER) {
          wrapperStyles = this.wrapperPopper?.state.styles;
        }

        nextStyles.wrapper = {
          ...nextStyles.wrapper,
          ...wrapperStyles,
        };
      }

      /* istanbul ignore else */
      if (this.target) {
        const targetStyles = window.getComputedStyle(this.target);

        /* istanbul ignore else */
        if (this.wrapperStyles) {
          nextStyles.wrapper = {
            ...nextStyles.wrapper,
            ...this.wrapperStyles,
          };
        } else if (!['relative', 'static'].includes(targetStyles.position)) {
          this.wrapperStyles = {};

          if (!positionWrapper) {
            POSITIONING_PROPS.forEach(d => {
              if (d === 'position') {
                this.wrapperStyles[d] = targetStyles[d] as React.CSSProperties['position'];
              } else {
                this.wrapperStyles[d] = targetStyles[d];
              }
            });

            nextStyles.wrapper = {
              ...nextStyles.wrapper,
              ...this.wrapperStyles,
            };

            this.target.style.position = 'relative';
            this.target.style.top = 'auto';
            this.target.style.right = 'auto';
            this.target.style.bottom = 'auto';
            this.target.style.left = 'auto';
          }
        }
      }

      this.cachedStyles = nextStyles as Styles;
    }

    return this.cachedStyles;
  }

  private get target() {
    if (!canUseDOM) return null;

    const { target } = this.props;

    if (target) {
      if (is.domElement(target)) {
        return target;
      }

      return document.querySelector(target) as HTMLElement;
    }

    return this.childRef.current || this.wrapperRef.current;
  }

  render(): JSX.Element {
    const { currentPlacement, positionWrapper, status } = this.state;
    const {
      children,
      component,
      content,
      footer,
      hideArrow,
      id = this.id,
      open,
      portalElement,
      showCloseButton,
      style,
      target,
      title,
    } = this.props;
    const wrapper = (
      <Wrapper
        childRef={this.childRef}
        id={id}
        isControlled={is.boolean(open)}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        status={status}
        style={style}
        styles={this.styles.wrapper}
        wrapperRef={this.wrapperRef}
      >
        {children}
      </Wrapper>
    );

    return (
      <React.Fragment>
        <Portal
          hasChildren={!!children}
          placement={currentPlacement}
          portalElement={portalElement}
          target={target}
          zIndex={this.styles.options.zIndex}
        >
          <Floater
            arrowRef={this.arrowRef}
            component={component}
            content={content}
            floaterRef={this.floaterRef}
            footer={footer}
            hideArrow={hideArrow || currentPlacement === 'center'}
            id={id}
            onClick={this.handleClick}
            placement={currentPlacement}
            positionWrapper={positionWrapper}
            showCloseButton={showCloseButton}
            status={status}
            styles={this.styles}
            title={title}
          />
          {positionWrapper && wrapper}
        </Portal>
        {!positionWrapper && wrapper}
      </React.Fragment>
    );
  }
}
