import React from 'react';
import PropTypes from 'prop-types';
import Popper from 'popper.js';
import deepmerge from 'deepmerge';
import isRequiredIf from 'react-proptype-conditional-require';

import STATUS from './status';
import { canUseDOM, isMobile, isNode, once } from './utils';

import Portal from './Portal';
import Tooltip from './Tooltip';
import Wrapper from './Wrapper';

import stylesDefault from './styles';

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
    component: isRequiredIf(PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element,
    ]), props => !props.content),
    content: isRequiredIf(PropTypes.node, props => !props.component),
    event: PropTypes.oneOf(['hover', 'click']),
    eventDelay: PropTypes.number,
    flip: PropTypes.bool,
    footer: PropTypes.node,
    hideArrow: PropTypes.bool,
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
    const { flip, hideArrow, offset, placement, wrapperOptions } = this.props;
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
            enabled: !hideArrow,
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

  setArrowRef = (ref) => {
    this.arrow = ref;
  };

  setChildRef = (ref) => {
    this.child = ref;
  };

  setTooltipRef = (ref) => {
    if (!this.tooltip) {
      this.tooltip = ref;
    }
  };

  setWrapperRef = (ref) => {
    this.wrapper = ref;
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

  render() {
    const { currentPlacement, positionWrapper, status } = this.state;
    const {
      animate,
      children,
      content,
      footer,
      hideArrow,
      open,
      component,
      showCloseButton,
      style,
      title
    } = this.props;

    return (
      <div style={{ lineHeight: 0 }}>
        <Portal
          {...this.props}
          hasChildren={!!children}
          placement={currentPlacement}
          setRef={this.setTooltipRef}
          status={status}
        >
          <Tooltip
            animate={animate}
            component={component}
            content={content}
            footer={footer}
            handleClick={this.handleClick}
            hideArrow={hideArrow || currentPlacement === 'center'}
            open={open}
            placement={currentPlacement}
            positionWrapper={positionWrapper}
            setArrowRef={this.setArrowRef}
            setTooltipRef={this.setTooltipRef}
            showCloseButton={showCloseButton}
            status={status}
            styles={this.styles}
            target={this.target}
            title={title}
          />
        </Portal>
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
      </div>
    );
  }
}
