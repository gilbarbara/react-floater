import React from 'react';
import PropTypes from 'prop-types';
import STATUS from './status';
import { isFixed } from './utils';

export default class Tooltip extends React.Component {
  static propTypes = {
    animate: PropTypes.bool.isRequired,
    content: PropTypes.node.isRequired,
    currentPlacement: PropTypes.string.isRequired,
    footer: PropTypes.node,
    handleClick: PropTypes.func.isRequired,
    open: PropTypes.bool,
    positionWrapper: PropTypes.bool.isRequired,
    setArrowRef: PropTypes.func.isRequired,
    setTooltipRef: PropTypes.func.isRequired,
    showCloseButton: PropTypes.bool,
    status: PropTypes.string.isRequired,
    styles: PropTypes.object.isRequired,
    target: PropTypes.object,
    title: PropTypes.node,
  };

  get tooltipStyle() {
    const { animate, currentPlacement, status, styles, target } = this.props;
    const {
      arrow: { length },
      tooltip,
      tooltipCentered,
      tooltipClosing,
      tooltipOpening,
      tooltipWithAnimation,
    } = styles;
    let element = {};

    if (currentPlacement.startsWith('top')) {
      element.padding = `0 10px ${length}px`;
    }
    else if (currentPlacement.startsWith('bottom')) {
      element.padding = `${length}px 10px 0`;
    }
    else if (currentPlacement.startsWith('left')) {
      element.padding = `0 ${length}px 0 0`;
    }
    else if (currentPlacement.startsWith('right')) {
      element.padding = `0 0 0 ${length}px`;
    }

    if ([STATUS.OPENING, STATUS.OPEN].includes(status)) {
      element = { ...element, ...tooltipOpening };
    }

    if (status === STATUS.CLOSING) {
      element = { ...element, ...tooltipClosing };
    }

    if (status === STATUS.OPEN && animate && !isFixed(target)) {
      element = { ...element, ...tooltipWithAnimation };
    }

    if (currentPlacement === 'center') {
      element = { ...element, ...tooltipCentered };
    }

    return {
      ...tooltip,
      ...element,
    };
  }

  get arrowStyle() {
    const { currentPlacement, styles } = this.props;
    const { length } = styles.arrow;
    const arrow = {
      position: 'absolute',
    };

    /* istanbul ignore else */
    if (currentPlacement.startsWith('top')) {
      arrow.bottom = length;
      arrow.left = 0;
      arrow.right = 0;
    }
    else if (currentPlacement.startsWith('bottom')) {
      arrow.top = 0;
      arrow.left = 0;
      arrow.right = 0;
    }
    else if (currentPlacement.startsWith('left')) {
      arrow.right = 0;
      arrow.top = 0;
      arrow.bottom = 0;
    }
    else if (currentPlacement.startsWith('right')) {
      arrow.left = 0;
      arrow.top = 0;
    }

    return arrow;
  }

  renderArrow() {
    const { currentPlacement, setArrowRef, styles } = this.props;
    const { arrow: { color, display, length, position, spread } } = styles;
    const arrowStyles = { display, position };

    let points;
    let x = spread;
    let y = length;

    /* istanbul ignore else */
    if (currentPlacement.startsWith('top')) {
      points = `0,0 ${x / 2},${y} ${x},0`;
      arrowStyles.bottom = -y;
    }
    else if (currentPlacement.startsWith('bottom')) {
      points = `${x},${y} ${x / 2},0 0,${y}`;
      arrowStyles.top = 0;
    }
    else if (currentPlacement.startsWith('left')) {
      y = spread;
      x = length;
      points = `0,0 ${x},${y / 2} 0,${y}`;
      arrowStyles.right = 0;
    }
    else if (currentPlacement.startsWith('right')) {
      y = spread;
      x = length;
      points = `${x},${y} ${x},0 0,${y / 2}`;
      arrowStyles.left = 0;
    }

    return (
      <span ref={setArrowRef} style={arrowStyles}>
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

  render() {
    const {
      content,
      currentPlacement,
      footer,
      handleClick,
      open,
      positionWrapper,
      setTooltipRef,
      showCloseButton,
      title,
      styles
    } = this.props;

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
      output.close = (<button style={styles.close} onClick={handleClick}>⨉</button>);
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
        ref={setTooltipRef}
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
}
