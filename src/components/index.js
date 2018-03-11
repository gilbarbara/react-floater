import React from 'react';
import PropTypes from 'prop-types';
import isRequiredIf from 'react-proptype-conditional-require';
import Popper from 'popper.js';
import deepmerge from 'deepmerge';
import is from 'is-lite';

import DEFAULTS from '../defaults';
import STATUS from '../status';
import { canUseDOM, comparator, isMobile, log, noop, once } from '../utils';

import Portal from './Portal';
import Tooltip from './Tooltip';
import Wrapper from './Wrapper';

import stylesDefault from '../styles';

const positioningProps = ['position', 'top', 'right', 'bottom', 'left'];

export default class ReactTooltips extends React.Component {
  constructor(props) {
    super(props);

    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const { children, open, target, wrapperOptions } = this.props;

      if (wrapperOptions.position && !target) {
        console.warn('Missing props! You need to set a `target` to use `wrapperOptions.position`'); //eslint-disable-line no-console
      }

      if (!children && !is.boolean(open)) {
        console.warn('Missing props! You need to set `children`.'); //eslint-disable-line no-console
      }
    }

    this.state = {
      currentPlacement: props.placement,
      positionWrapper: props.wrapperOptions.position && !!props.target,
      status: STATUS.INIT,
      statusWrapper: STATUS.INIT,
    };
  }

  static propTypes = {
    autoOpen: PropTypes.bool,
    callback: PropTypes.func,
    children: PropTypes.node,
    component: isRequiredIf(PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element,
    ]), props => !props.content),
    content: isRequiredIf(PropTypes.node, props => !props.component),
    debug: PropTypes.bool,
    disableAnimation: PropTypes.bool,
    disableFlip: PropTypes.bool,
    disableHoverToClick: PropTypes.bool,
    event: PropTypes.oneOf(['hover', 'click']),
    eventDelay: PropTypes.number,
    footer: PropTypes.node,
    getPopper: PropTypes.func,
    hideArrow: PropTypes.bool,
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    offset: PropTypes.number,
    open: PropTypes.bool,
    options: PropTypes.object,
    placement: PropTypes.oneOf([
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end',
      'auto', 'center',
    ]),
    showCloseButton: PropTypes.bool,
    style: PropTypes.object,
    styles: PropTypes.object,
    target: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]),
    title: PropTypes.node,
    wrapperOptions: PropTypes.shape({
      placement: PropTypes.oneOf([
        'top', 'top-start', 'top-end',
        'bottom', 'bottom-start', 'bottom-end',
        'left', 'left-start', 'left-end',
        'right', 'right-start', 'right-end',
        'auto',
      ]),
      position: PropTypes.bool,
      offset: PropTypes.number,
    })
  };

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
    }
  };

  componentDidMount() {
    if (!canUseDOM) return;
    const { positionWrapper } = this.state;
    const { children, open, target } = this.props;

    log({
      title: 'init',
      data: {
        hasChildren: !!children,
        hasTarget: !!target,
        isControlled: is.boolean(open),
        positionWrapper,
        target: this.target,
        tooltip: this.tooltipRef,
      },
      debug: this.debug,
    });

    this.initPopper();

    if (!children && target && !is.boolean(open)) {
      // add event listener based on event,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!canUseDOM) return;

    const { open, target, wrapperOptions } = this.props;

    if (open !== nextProps.open) {
      this.toggle();
    }

    if (wrapperOptions.position !== nextProps.wrapperOptions.position || target !== nextProps.target) {
      this.changeWrapperPosition(nextProps);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!canUseDOM) return;

    const { autoOpen, open } = this.props;
    const { changedFrom, changedTo } = comparator(prevState, this.state);

    if (changedTo('status', STATUS.IDLE) && open) {
      this.toggle(STATUS.OPEN);
    }
    else if (changedFrom('status', STATUS.INIT, STATUS.IDLE) && autoOpen) {
      this.toggle(STATUS.OPEN);
    }

    if (
      this.tooltipRef
      && (changedTo('status', STATUS.OPENING) || changedTo('status', STATUS.CLOSING)
      )
    ) {
      once(this.tooltipRef, 'transitionend', this.handleTransitionEnd);
    }
  }

  componentWillUnmount() {
    if (!canUseDOM) return;

    if (this.popper) {
      this.popper.instance.destroy();
    }

    if (this.wrapperPopper) {
      this.wrapperPopper.instance.destroy();
    }
  }

  initPopper(target = this.target) {
    const { positionWrapper } = this.state;
    const { disableFlip, getPopper, hideArrow, offset, placement, wrapperOptions } = this.props;
    const flipBehavior = placement === 'top' || placement === 'bottom' ? 'flip' : [
      'right',
      'bottom-end',
      'top-end',
      'left',
      'top-start',
      'bottom-start',
    ];

    /* istanbul ignore else */
    if (placement === 'center') {
      this.setState({ status: STATUS.IDLE });
    }
    else if (target && this.tooltipRef) {
      new Popper(target, this.tooltipRef, {
        placement,
        modifiers: {
          arrow: {
            enabled: !hideArrow,
            element: this.arrowRef,
            ...this.options.arrow,
          },
          computeStyle: this.options.computeStyle,
          flip: {
            enabled: !disableFlip,
            behavior: flipBehavior,
            ...this.options.flip,
          },
          keepTogether: this.options.keepTogether,
          hide: this.options.hide,
          inner: this.options.inner,
          offset: {
            offset: `0, ${offset}px`,
            ...this.options.offset,
          },
          preventOverflow: this.options.preventOverflow,
          shift: this.options.shift,
        },
        onCreate: (data) => {
          this.popper = data;

          getPopper(data, 'tooltip');

          this.setState({
            currentPlacement: data.placement,
            status: STATUS.IDLE,
          });

          if (placement !== data.placement) {
            setTimeout(() => {
              data.instance.update();
            }, 1);
          }
        },
        onUpdate: (data) => {
          this.popper = data;

          if (data.placement !== this.state.currentPlacement) {
            this.setState({ currentPlacement: data.placement });
          }
        }
      });
    }

    if (positionWrapper) {
      const wrapperOffset = !is.undefined(wrapperOptions.offset) ? wrapperOptions.offset : 0;

      new Popper(this.target, this.wrapperRef, {
        placement: wrapperOptions.placement || placement,
        modifiers: {
          arrow: {
            enabled: false,
          },
          offset: {
            offset: `0, ${wrapperOffset}px`,
          },
          flip: {
            enabled: false,
          }
        },
        onCreate: (data) => {
          this.wrapperPopper = data;
          this.setState({ statusWrapper: STATUS.IDLE });

          getPopper(data, 'wrapper');

          if (placement !== data.placement) {
            setTimeout(() => {
              data.instance.update();
            }, 1);
          }
        }
      });
    }
  }

  changeWrapperPosition({ target, wrapperOptions }) {
    this.setState({
      positionWrapper: wrapperOptions.position && !!target
    });
  }

  toggle(forceStatus) {
    let status = this.state.status === STATUS.OPEN ? STATUS.CLOSING : STATUS.OPENING;

    if (!is.undefined(forceStatus)) {
      status = forceStatus;
    }

    this.setState({ status });
  }

  setArrowRef = (ref) => {
    this.arrowRef = ref;
  };

  setChildRef = (ref) => {
    this.childRef = ref;
  };

  setTooltipRef = (ref) => {
    if (!this.tooltipRef) {
      this.tooltipRef = ref;
    }
  };

  setWrapperRef = (ref) => {
    this.wrapperRef = ref;
  };

  handleTransitionEnd = () => {
    const { callback } = this.props;

    /* istanbul ignore else */
    if (this.wrapperPopper) {
      this.wrapperPopper.instance.update();
    }

    this.setState({
      status: this.state.status === STATUS.OPENING ? STATUS.OPEN : STATUS.IDLE
    }, () => {
      callback(this.state.status === STATUS.OPEN ? 'open' : 'close', this.props);
    });
  };

  handleClick = () => {
    if (is.boolean(this.props.open)) return;

    const { status } = this.state;

    /* istanbul ignore else */
    if (this.event === 'click') {
      log({
        title: 'click',
        data: [
          { event: this.props.event, status: status === STATUS.OPEN ? 'closing' : 'opening' },
        ],
        debug: this.debug,
      });

      this.toggle();
    }
  };

  handleMouseEnter = () => {
    if (is.boolean(this.props.open) || isMobile()) return;
    const { status } = this.state;

    /* istanbul ignore else */
    if (this.event === 'hover' && status === STATUS.IDLE) {
      log({
        title: 'mouseEnter',
        data: [
          { key: 'originalEvent', value: this.props.event },
        ],
        debug: this.debug,
      });

      clearTimeout(this.eventDelayTimeout);
      this.toggle();
    }
  };

  handleMouseLeave = () => {
    if (is.boolean(this.props.open) || isMobile()) return;

    const { event, eventDelay } = this.props;
    const { status, positionWrapper } = this.state;

    /* istanbul ignore else */
    if (this.event === 'hover') {
      log({
        title: 'mouseLeave',
        data: [
          { key: 'originalEvent', value: event },
        ],
        debug: this.debug,
      });

      if (!eventDelay) {
        this.toggle(STATUS.IDLE);
      }
      else if ([STATUS.OPENING, STATUS.OPEN].includes(status) && !positionWrapper && !this.eventDelayTimeout) {
        this.eventDelayTimeout = setTimeout(() => {
          delete this.eventDelayTimeout;

          this.toggle();
        }, eventDelay * 1000);
      }
    }
  };

  get debug() {
    return this.props.debug || !!global.ReactTooltipsDebug;
  }

  get event() {
    const { disableHoverToClick, event } = this.props;

    if (event === 'hover' && isMobile() && !disableHoverToClick) {
      return 'click';
    }

    return event;
  }

  get options() {
    const { options } = this.props;

    return deepmerge(DEFAULTS, options || {});
  }

  get styles() {
    const { status, positionWrapper, statusWrapper } = this.state;
    const { styles } = this.props;

    const nextStyles = deepmerge(stylesDefault, styles);

    if (positionWrapper) {
      let wrapperStyles;

      if (![STATUS.IDLE].includes(status) || ![STATUS.IDLE].includes(statusWrapper)) {
        wrapperStyles = nextStyles.wrapperPosition;
      }
      else {
        wrapperStyles = this.wrapperPopper.styles;
      }

      nextStyles.wrapper = {
        ...nextStyles.wrapper,
        ...wrapperStyles
      };
    }

    /* istanbul ignore else */
    if (this.target) {
      const targetStyles = window.getComputedStyle(this.target);

      /* istanbul ignore else */
      if (this.wrapperStyles) {
        nextStyles.wrapper = {
          ...nextStyles.wrapper,
          ...this.wrapperStyles
        };
      }
      else if (!['relative', 'static'].includes(targetStyles.position)) {
        this.wrapperStyles = {};

        if (!positionWrapper) {
          if (!this.position) {
            this.position = targetStyles.position;
          }

          positioningProps.forEach(d => {
            this.wrapperStyles[d] = targetStyles[d];
          });

          if (!this.wrapperStyles) {
            nextStyles.wrapper = {
              ...nextStyles.wrapper,
              ...this.wrapperStyles
            };
          }

          this.target.style.position = 'relative';
          this.target.style.top = 'auto';
          this.target.style.right = 'auto';
          this.target.style.bottom = 'auto';
          this.target.style.left = 'auto';
        }
      }
    }

    return nextStyles;
  }

  get target() {
    const { target } = this.props;

    if (target) {
      if (is.domElement(target)) {
        return target;
      }

      return document.querySelector(target);
    }

    return this.childRef || this.wrapperRef;
  }

  render() {
    const { currentPlacement, positionWrapper, status } = this.state;
    const {
      children,
      component,
      content,
      disableAnimation,
      footer,
      hideArrow,
      open,
      showCloseButton,
      style,
      title,
    } = this.props;

    const wrapper = (
      <Wrapper
        handleClick={this.handleClick}
        handleMouseEnter={this.handleMouseEnter}
        handleMouseLeave={this.handleMouseLeave}
        setChildRef={this.setChildRef}
        setWrapperRef={this.setWrapperRef}
        style={style}
        styles={this.styles.wrapper}
      >
        {children}
      </Wrapper>
    );

    const output = {};

    if (positionWrapper) {
      output.wrapperInPortal = wrapper;
    }
    else {
      output.wrapperAsChildren = wrapper;
    }

    return (
      <span>
        <Portal
          {...this.props}
          hasChildren={!!children}
          placement={currentPlacement}
          setRef={this.setTooltipRef}
          status={status}
        >
          <Tooltip
            component={component}
            content={content}
            disableAnimation={disableAnimation}
            footer={footer}
            handleClick={this.handleClick}
            hideArrow={hideArrow || currentPlacement === 'center'}
            isPositioned={!!this.position}
            open={open}
            placement={currentPlacement}
            positionWrapper={positionWrapper}
            setArrowRef={this.setArrowRef}
            setTooltipRef={this.setTooltipRef}
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
