import React from 'react';
import PropTypes from 'prop-types';
import Popper from 'popper.js';
import deepmerge from 'deepmerge';
import { canUseDOM, isFixed, isMobile, isNode, once } from './utils';

import Tooltip from './Tooltip';

import stylesDefault from './styles';

const STATUS = {
  INIT: 'init',
  IDLE: 'idle',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing',
  ERROR: 'error',
};

const positioningProps = ['position', 'top', 'right', 'bottom', 'left'];

export default class ReactTooltips extends React.Component {
  constructor(props) {
    super(props);

    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      if (props.wrapperOptions.position && !props.target) {
        console.warn('Missing props! You need to set a `target` to use `wrapperOptions.position`'); //eslint-disable-line no-console
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
    animate: PropTypes.bool,
    autoOpen: PropTypes.bool,
    callback: PropTypes.func,
    children: PropTypes.node,
    content: PropTypes.node.isRequired,
    event: PropTypes.oneOf(['hover', 'click']),
    eventDelay: PropTypes.number,
    flip: PropTypes.bool,
    footer: PropTypes.node,
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    offset: PropTypes.number,
    open: PropTypes.bool,
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
    animate: true,
    autoOpen: false,
    callback: () => {},
    event: 'click',
    eventDelay: 0.4,
    flip: true,
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

    this.initPopper();
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

    const { status } = this.state;
    const { autoOpen, open } = this.props;

    if (prevState.status === STATUS.INIT && status === STATUS.IDLE) {
      if (autoOpen || open) {
        this.toggle(STATUS.OPEN);
      }
    }

    if (
      this.tooltip
      && ((prevState.status !== STATUS.OPENING && status === STATUS.OPENING)
        || (prevState.status !== STATUS.CLOSING && status === STATUS.CLOSING))
    ) {
      once(this.tooltip, 'transitionend', this.handleTransitionEnd);
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
    const { flip, offset, placement, wrapperOptions } = this.props;
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
    else if (target && this.tooltip) {
      new Popper(target, this.tooltip, {
        placement,
        modifiers: {
          arrow: {
            element: this.arrow,
          },
          offset: {
            offset: `0, ${offset}px`,
          },
          preventOverflow: {
            padding: 10,
          },
          flip: {
            enabled: flip,
            behavior: flipBehavior,
            padding: 20,
          }
        },
        onCreate: (data) => {
          this.popper = data;

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
      const wrapperOffset = typeof wrapperOptions.offset !== 'undefined' ? wrapperOptions.offset : 0;

      new Popper(this.target, this.wrapper, {
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

    if (typeof forceStatus !== 'undefined') {
      status = forceStatus;
    }

    this.setState({ status });
  }

  setRef = (ref) => {
    this.tooltip = ref;
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
    if (typeof this.props.open !== 'undefined') return;

    const { positionWrapper } = this.state;

    /* istanbul ignore else */
    if (this.eventType === 'click' || (positionWrapper && this.eventType === 'hover')) {
      this.toggle();
    }
  };

  handleMouseEnter = () => {
    if (typeof this.props.open !== 'undefined') return;

    /* istanbul ignore else */
    if (this.eventType === 'hover') {
      clearTimeout(this.eventDelayTimeout);
      this.toggle();
    }
  };

  handleMouseLeave = () => {
    const { status, positionWrapper } = this.state;
    const { eventDelay, open } = this.props;

    if (typeof open !== 'undefined') return;

    /* istanbul ignore else */
    if (this.eventType === 'hover') {
      if (!eventDelay) {
        this.toggle(STATUS.IDLE);
      }
      else if ([STATUS.OPENING, STATUS.OPEN].includes(status) && !positionWrapper) {
        this.eventDelayTimeout = setTimeout(() => {
          this.toggle();
        }, eventDelay * 1000);
      }
    }
  };

  get eventType() {
    const { event } = this.props;

    if (event === 'hover' && isMobile()) {
      return 'click';
    }

    return event;
  }

  get target() {
    const { target } = this.props;

    if (target) {
      if (isNode(target)) {
        return target;
      }

      return document.querySelector(target);
    }

    return this.child || this.wrapper;
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
      const wrapperComputedStyles = window.getComputedStyle(this.target);

      /* istanbul ignore else */
      if (!this.wrapperStyles) {
        nextStyles.wrapper = {
          ...nextStyles.wrapper,
          ...this.wrapperStyles
        };
      }
      else if (!['relative', 'static'].includes(wrapperComputedStyles.position)) {
        this.wrapperStyles = {};

        positioningProps.forEach(d => {
          this.wrapperStyles[d] = wrapperComputedStyles[d];
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

    return nextStyles;
  }

  get tooltipStyle() {
    const { currentPlacement, status } = this.state;
    const { animate } = this.props;
    const {
      arrow: { length },
      tooltip,
      tooltipCentered,
      tooltipClosing,
      tooltipOpening,
      tooltipWithAnimation,
    } = this.styles;
    let styles = {};

    if (currentPlacement.startsWith('top')) {
      styles.padding = `0 10px ${length}px`;
    }
    else if (currentPlacement.startsWith('bottom')) {
      styles.padding = `${length}px 10px 0`;
    }
    else if (currentPlacement.startsWith('left')) {
      styles.padding = `0 ${length}px 0 0`;
    }
    else if (currentPlacement.startsWith('right')) {
      styles.padding = `0 0 0 ${length}px`;
    }

    if ([STATUS.OPENING, STATUS.OPEN].includes(status)) {
      styles = { ...styles, ...tooltipOpening };
    }

    if (status === STATUS.CLOSING) {
      styles = { ...styles, ...tooltipClosing };
    }

    if (status === STATUS.OPEN && animate && !isFixed(this.target)) {
      styles = { ...styles, ...tooltipWithAnimation };
    }

    if (currentPlacement === 'center') {
      styles = { ...styles, ...tooltipCentered };
    }

    return {
      ...tooltip,
      ...styles,
    };
  }

  get arrowStyle() {
    const { currentPlacement } = this.state;
    const { length } = this.styles.arrow;
    const styles = {
      position: 'absolute',
    };

    /* istanbul ignore else */
    if (currentPlacement.startsWith('top')) {
      styles.bottom = length;
      styles.left = 0;
      styles.right = 0;
    }
    else if (currentPlacement.startsWith('bottom')) {
      styles.top = 0;
      styles.left = 0;
      styles.right = 0;
    }
    else if (currentPlacement.startsWith('left')) {
      styles.right = 0;
      styles.top = 0;
      styles.bottom = 0;
    }
    else if (currentPlacement.startsWith('right')) {
      styles.left = 0;
      styles.top = 0;
    }

    return styles;
  }

  renderArrow() {
    const { currentPlacement } = this.state;
    const { arrow: { color, display, length, position, spread } } = this.styles;
    const styles = { display, position };

    let points;
    let x = spread;
    let y = length;

    /* istanbul ignore else */
    if (currentPlacement.startsWith('top')) {
      points = `0,0 ${x / 2},${y} ${x},0`;
      styles.bottom = -y;
    }
    else if (currentPlacement.startsWith('bottom')) {
      points = `${x},${y} ${x / 2},0 0,${y}`;
      styles.top = 0;
    }
    else if (currentPlacement.startsWith('left')) {
      y = spread;
      x = length;
      points = `0,0 ${x},${y / 2} 0,${y}`;
      styles.right = 0;
    }
    else if (currentPlacement.startsWith('right')) {
      y = spread;
      x = length;
      points = `${x},${y} ${x},0 0,${y / 2}`;
      styles.left = 0;
    }

    return (
      <span ref={c => (this.arrow = c)} style={styles}>
        <svg
          width={x}
          height={y}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points={points} fill={color} />
        </svg>
      </span>
    );
  }

  renderTooltip() {
    const { currentPlacement, positionWrapper } = this.state;
    const { content, footer, open, showCloseButton, title } = this.props;

    const { styles } = this;

    const output = {
      content: React.isValidElement(content)
        ? content
        : <div className="__tooltip__content" style={styles.content}>{content}</div>
    };

    if (title) {
      output.title = React.isValidElement(title)
        ? title
        : <div className="__tooltip__title" style={styles.title}>{title}</div>;
    }

    if (footer) {
      output.footer = React.isValidElement(footer)
        ? footer
        : <div className="__tooltip__footer" style={styles.footer}>{footer}</div>;
    }

    if (
      (showCloseButton || positionWrapper)
      && typeof open === 'undefined'
    ) {
      output.close = (<button style={styles.close} onClick={this.handleClick}>⨉</button>);
    }

    if (currentPlacement !== 'center') {
      output.arrow = (
        <div
          className="__tooltip__arrow"
          style={this.arrowStyle}
        >
          {this.renderArrow()}
        </div>
      );
    }

    return (
      <div
        ref={c => (this.tooltip = c)}
        className="__tooltip"
        style={this.tooltipStyle}
      >
        <div className="__tooltip__container" style={styles.container}>
          {output.close}
          {output.title}
          {output.content}
          {output.footer}
        </div>
        {output.arrow}
      </div>
    );
  }

  renderWrapper() {
    const { children, style } = this.props;
    const { wrapper } = this.styles;
    let element;

    /* istanbul ignore else */
    if (children) {
      if (React.Children.count(children) === 1) {
        if (!React.isValidElement(children)) {
          element = <span>{children}</span>;
        }
        else {
          element = React.cloneElement(React.Children.only(children), {
            ref: c => (this.child = c)
          });
        }
      }
      else {
        element = children;
      }
    }

    return (
      <span
        key="wrapper"
        ref={c => (this.wrapper = c)}
        style={{ ...wrapper, ...style }}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {element}
      </span>
    );
  }

  render() {
    return (
      <Tooltip
        {...this.props}
        placement={this.state.currentPlacement}
        setRef={this.setRef}
        status={this.state.status}
        tooltip={this.renderTooltip()}
        wrapper={this.renderWrapper()}
      />);
  }
}
