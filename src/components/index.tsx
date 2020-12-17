import * as React from 'react';
import Popper, { Data, Behavior, Position } from 'popper.js';
import is from 'is-lite';
import treeChanges from 'tree-changes';

import STATUS from '../status';
import { canUseDOM, getOptions, isFixed, isMobile, log, noop, once } from '../utils';

import { PlainObject, Props, State, Statuses, Styles } from '../types';

import Portal from './Portal';
import Floater from './Floater';
import Wrapper from './Wrapper';

import getStyles from '../styles';

declare let window: any;

const POSITIONING_PROPS = ['position', 'top', 'right', 'bottom', 'left'] as const;

export default class ReactFloater extends React.PureComponent<Props, State> {
  arrowRef = React.createRef<HTMLSpanElement>();
  childRef = React.createRef<HTMLElement>();
  eventDelayTimeout?: number;
  floaterRef = React.createRef<HTMLDivElement>();
  isActive = false;
  popper?: Data;
  wrapperPopper?: Data;
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
    callback: noop,
    debug: false,
    disableAnimation: false,
    disableFlip: false,
    disableHoverToClick: false,
    event: 'click',
    eventDelay: 0.4,
    getPopper: noop,
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

    if (!children && target && !is.boolean(open)) {
      // add event listener based on event,
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (!canUseDOM) return;

    const { autoOpen, open, target, wrapperOptions } = this.props;
    const { changedFrom, changed } = treeChanges(prevState, this.state);

    if (prevProps.open !== open) {
      let forceStatus;

      // always follow `open` in controlled mode
      if (is.boolean(open)) {
        forceStatus = open ? STATUS.OPENING : STATUS.CLOSING;
      }

      this.toggle(forceStatus);
    }

    if (
      prevProps.wrapperOptions?.position !== wrapperOptions?.position ||
      prevProps.target !== target
    ) {
      this.changeWrapperPosition(this.props);
    }

    if (changed('status', STATUS.IDLE) && open) {
      this.toggle(STATUS.OPEN);
    } else if (changedFrom('status', STATUS.INIT, STATUS.IDLE) && autoOpen) {
      this.toggle(STATUS.OPEN);
    }

    if (this.popper && changed('status', STATUS.OPENING)) {
      this.popper.instance.update();
    }

    if (
      this.floaterRef.current &&
      (changed('status', STATUS.OPENING) || changed('status', STATUS.CLOSING))
    ) {
      once(this.floaterRef.current, 'transitionend', this.handleTransitionEnd);
    }
  }

  componentWillUnmount(): void {
    if (!canUseDOM) return;

    this.isActive = false;

    if (this.popper) {
      this.popper.instance.destroy();
    }

    if (this.wrapperPopper) {
      this.wrapperPopper.instance.destroy();
    }

    window.removeEventListener('load', this.handleLoad);
  }

  private initPopper(target = this.target) {
    const { positionWrapper } = this.state;
    const {
      disableFlip,
      getPopper,
      hideArrow,
      offset,
      options,
      placement,
      wrapperOptions,
    } = this.props;
    const flipBehavior: Behavior | Position[] =
      placement === 'top' || placement === 'bottom' ? 'flip' : ['right', 'bottom', 'left', 'top'];

    /* istanbul ignore else */
    if (placement === 'center') {
      this.setState({ status: STATUS.IDLE });
    } else if (target && this.floaterRef.current) {
      const { arrow, flip, offset: offsetOptions, ...rest } = getOptions(options);

      new Popper(target, this.floaterRef.current, {
        placement,
        positionFixed: isFixed(this.childRef.current),
        modifiers: {
          arrow: {
            enabled: !hideArrow,
            element: this.arrowRef.current || undefined,
            ...arrow,
          },
          flip: {
            enabled: !disableFlip,
            behavior: flipBehavior,
            ...flip,
          },
          offset: {
            offset: `0, ${offset}px`,
            ...offsetOptions,
          },
          ...rest,
        },
        onCreate: data => {
          this.popper = data;

          if (getPopper) {
            getPopper(data, 'floater');
          }

          if (this.isActive) {
            this.setState({
              currentPlacement: data.placement,
              status: STATUS.IDLE,
            });
          }

          if (placement !== data.placement) {
            setTimeout(() => {
              data.instance.update();
            }, 1);
          }
        },
        onUpdate: data => {
          this.popper = data;
          const { currentPlacement } = this.state;

          if (this.isActive && data.placement !== currentPlacement) {
            this.setState({ currentPlacement: data.placement });
          }
        },
      });
    }

    if (positionWrapper && this.target && this.wrapperRef.current && placement !== 'center') {
      const wrapperOffset = wrapperOptions?.offset ? wrapperOptions.offset : 0;

      new Popper(this.target, this.wrapperRef.current, {
        placement: wrapperOptions?.placement || placement,
        modifiers: {
          arrow: {
            enabled: false,
          },
          offset: {
            offset: `0, ${wrapperOffset}px`,
          },
          flip: {
            enabled: false,
          },
        },
        onCreate: data => {
          this.wrapperPopper = data;

          if (this.isActive) {
            this.setState({ statusWrapper: STATUS.IDLE });
          }

          if (getPopper) {
            getPopper(data, 'wrapper');
          }

          if (placement !== data.placement) {
            setTimeout(() => {
              data.instance.update();
            }, 1);
          }
        },
      });
    }
  }

  private changeWrapperPosition({ target, wrapperOptions }: Props) {
    this.setState({
      positionWrapper: !!wrapperOptions?.position && !!target,
    });
  }

  private toggle(forceStatus?: Statuses) {
    const { status } = this.state;
    let nextStatus: Statuses = status === STATUS.OPEN ? STATUS.CLOSING : STATUS.OPENING;

    if (!is.undefined(forceStatus)) {
      nextStatus = forceStatus;
    }

    this.setState({ status: nextStatus });
  }

  private handleClick = () => {
    const { event, open } = this.props;

    if (is.boolean(open)) return;

    const { positionWrapper, status } = this.state;

    /* istanbul ignore else */
    if (this.event === 'click' || (this.event === 'hover' && positionWrapper)) {
      log({
        title: 'click',
        data: [{ event, status: status === STATUS.OPEN ? 'closing' : 'opening' }],
        debug: this.debug,
      });

      this.toggle();
    }
  };

  private handleLoad = () => {
    if (this.popper) {
      this.popper.instance.update();
    }

    if (this.wrapperPopper) {
      this.wrapperPopper.instance.update();
    }
  };

  private handleMouseEnter = () => {
    const { event, open } = this.props;

    if (is.boolean(open) || isMobile()) return;

    const { status } = this.state;

    /* istanbul ignore else */
    if (this.event === 'hover' && status === STATUS.IDLE) {
      log({
        title: 'mouseEnter',
        data: [{ key: 'originalEvent', value: event }],
        debug: this.debug,
      });

      clearTimeout(this.eventDelayTimeout);
      this.toggle();
    }
  };

  private handleMouseLeave = () => {
    const { event, eventDelay, open } = this.props;

    if (is.boolean(open) || isMobile()) return;

    const { status, positionWrapper } = this.state;

    /* istanbul ignore else */
    if (this.event === 'hover') {
      log({
        title: 'mouseLeave',
        data: [{ key: 'originalEvent', value: event }],
        debug: this.debug,
      });

      const hasOpenStatus = status === STATUS.OPENING || status === STATUS.OPEN;

      if (!eventDelay) {
        this.toggle(STATUS.IDLE);
      } else if (hasOpenStatus && !positionWrapper && !this.eventDelayTimeout) {
        this.eventDelayTimeout = window.setTimeout(() => {
          delete this.eventDelayTimeout;

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
      this.wrapperPopper.instance.update();
    }

    this.setState(
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
    const { status, positionWrapper, statusWrapper } = this.state;
    const { styles } = this.props;

    const nextStyles: Styles = getStyles(styles);

    if (positionWrapper) {
      let wrapperStyles: PlainObject | undefined;

      if (status !== STATUS.IDLE || statusWrapper !== STATUS.IDLE) {
        wrapperStyles = nextStyles.wrapperPosition;
      } else {
        wrapperStyles = this.wrapperPopper?.styles;
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
            this.wrapperStyles[d] = targetStyles[d];
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

    return nextStyles as Styles;
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
      disableAnimation = false,
      footer,
      hideArrow,
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
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={style}
        styles={this.styles.wrapper}
        wrapperRef={this.wrapperRef}
      >
        {children}
      </Wrapper>
    );

    const output: PlainObject = {};

    if (positionWrapper) {
      output.wrapperInPortal = wrapper;
    } else {
      output.wrapperAsChildren = wrapper;
    }

    return (
      <span>
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
            disableAnimation={disableAnimation}
            floaterRef={this.floaterRef}
            footer={footer}
            hideArrow={hideArrow || currentPlacement === 'center'}
            onClick={this.handleClick}
            open={open}
            placement={currentPlacement}
            positionWrapper={positionWrapper}
            showCloseButton={showCloseButton}
            status={status}
            styles={this.styles}
            title={title}
          />
          {output.wrapperInPortal}
        </Portal>
        {output.wrapperAsChildren}
      </span>
    );
  }
}
