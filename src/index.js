import React from 'react';
import PropTypes from 'prop-types';
import Popper from 'popper.js';
import deepmerge from 'deepmerge';
import { canUseDOM, isFixed, isMobile, isNode, once } from './utils';

import Portal from './Portal';

import stylesDefault from './styles';

const STATUS = {
  IDLE: 'idle',
  READY: 'ready',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing',
  ERROR: 'error',
};

export default class ReactTooltips extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      status: STATUS.IDLE,
      currentPlacement: props.placement,
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
      'auto'
    ]),
    showCloseButton: PropTypes.bool,
    styles: PropTypes.object,
    target: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]),
    title: PropTypes.node,
  };

  static defaultProps = {
    animate: true,
    autoOpen: false,
    callback: () => {},
    event: 'click',
    eventDelay: 0.4,
    offset: 15,
    open: false,
    placement: 'bottom',
    showCloseButton: false,
    styles: {},
    target: null,
  };

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    const { open } = this.props;

    if (open !== nextProps.open) {
      this.toggle();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { status } = this.state;
    const { autoOpen, open } = this.props;

    if (prevState.status === STATUS.IDLE && status === STATUS.READY) {
      if (autoOpen || open) {
        this.toggle();
      }
    }

    if (
      (prevState.status !== STATUS.OPENING && status === STATUS.OPENING)
      || (prevState.status !== STATUS.CLOSING && status === STATUS.CLOSING)
    ) {
      once(this.tooltip, 'transitionend', this.handleTransitionEnd);
    }
  }

  componentWillUnmount() {
    this.popper.destroy();
  }

  init(target = this.target) {
    const { offset, placement } = this.props;
    const behavior = ['top', 'bottom'].includes(placement) ? 'flip' : ['right', 'bottom-end', 'left', 'top-start'];

    this.popper = new Popper(target, this.tooltip, {
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
          behavior,
          padding: 20,
        }
      },
      onCreate: (data) => {
        this.setState({
          currentPlacement: data.placement,
          status: STATUS.READY,
        });

        if (placement !== data.placement) {
          setTimeout(() => {
            data.instance.update();
          }, 1);
        }
      },
      onUpdate: (data) => {
        if (data.placement !== this.state.currentPlacement) {
          this.setState({ currentPlacement: data.placement });
        }
      }
    });
  }

  toggle(cb = () => {}) {
    this.setState({
      status: this.state.status === STATUS.OPEN ? STATUS.CLOSING : STATUS.OPENING
    }, cb);
  }

  setRef(ref) {
    this.tooltip = ref;
  }

  handleTransitionEnd = () => {
    const { callback } = this.props;

    this.setState({
      status: this.state.status === STATUS.OPENING ? STATUS.OPEN : STATUS.READY
    }, () => {
      callback(this.state.status === STATUS.OPEN ? 'open' : 'close', this.props);
    });
  };

  handleClick = () => {
    const { open } = this.props;

    if (this.eventType === 'click' && !open) {
      this.toggle();
    }
  };

  handleMouseEnter = () => {
    const { open } = this.props;

    if (this.eventType === 'hover' && !open) {
      clearTimeout(this.eventDelayTimeout);
      this.toggle();
    }
  };

  handleMouseLeave = () => {
    const { status } = this.state;
    const { eventDelay, open } = this.props;

    if (this.eventType === 'hover' && !open && [STATUS.OPENING, STATUS.OPEN].includes(status)) {
      if (!eventDelay) {
        this.toggle();
      }
      else {
        this.eventDelayTimeout = setTimeout(() => {
          this.toggle();
        }, eventDelay * 1000);
      }
    }
  };

  get eventType() {
    const { event } = this.props;

    return event;
  }

  get target() {
    const { target } = this.props;
    let element = this.wrapper;

    if (target) {
      if (isNode(target)) {
        element = target;
      }
      else {
        element = document.querySelector(target);
      }
    }

    return element;
  }

  get styles() {
    const { styles } = this.props;

    return deepmerge(stylesDefault, styles);
  }

  get tooltipStyle() {
    const { currentPlacement, status } = this.state;
    const { animate } = this.props;
    const {
      arrow: { length },
      tooltip,
      tooltipOpening,
      tooltipClosing,
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
    const { content, footer, showCloseButton, title } = this.props;
    const output = {
      content: React.isValidElement(content)
        ? content
        : <div className="__tooltip__content" style={this.styles.content}>{content}</div>
    };

    if (title) {
      output.title = React.isValidElement(title)
        ? title
        : <div className="__tooltip__title" style={this.styles.title}>{title}</div>;
    }

    if (footer) {
      output.footer = React.isValidElement(footer)
        ? footer
        : <div className="__tooltip__footer" style={this.styles.footer}>{footer}</div>;
    }

    if (showCloseButton && this.eventType === 'click') {
      output.close = (<button style={this.styles.close} onClick={this.handleClick}>×︎️</button>);
    }

    return (
      <div
        ref={c => (this.tooltip = c)}
        className="__tooltip"
        style={this.tooltipStyle}
      >
        <div className="__tooltip__container" style={this.styles.container}>
          {output.close}
          {output.title}
          {output.content}
          {output.footer}
        </div>
        <div
          className="__tooltip__arrow"
          style={this.arrowStyle}
        >
          {this.renderArrow()}
        </div>
      </div>
    );
  }

  renderWrapper() {
    const { children } = this.props;
    const { wrapper } = this.styles;

    return (
      <span
        key="wrapper"
        ref={c => (this.wrapper = c)}
        style={wrapper}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {children}
      </span>
    );
  }

  render() {
    return (
      <Portal
        {...this.props}
        setRef={this.setRef}
        status={this.state.status}
        tooltip={this.renderTooltip()}
        wrapper={this.renderWrapper()}
      />);
  }
}
