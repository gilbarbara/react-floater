import React from 'react';
import PropTypes from 'prop-types';
import STATUS from '../status';
import { isFixed } from '../utils';

import Arrow from './Arrow';
import Container from './Container';

export default class Tooltip extends React.Component {
  static propTypes = {
    animate: PropTypes.bool.isRequired,
    content: PropTypes.node,
    footer: PropTypes.node,
    handleClick: PropTypes.func.isRequired,
    hideArrow: PropTypes.bool.isRequired,
    open: PropTypes.bool,
    placement: PropTypes.string.isRequired,
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
    const { animate, component, placement, hideArrow, status, styles, target } = this.props;
    const {
      arrow: { length },
      tooltip,
      tooltipCentered,
      tooltipClosing,
      tooltipOpening,
      tooltipWithAnimation,
      tooltipWithComponent,
    } = styles;
    let element = {};

    if (!hideArrow) {
      if (placement.startsWith('top')) {
        element.padding = `0 10px ${length}px`;
      }
      else if (placement.startsWith('bottom')) {
        element.padding = `${length}px 10px 0`;
      }
      else if (placement.startsWith('left')) {
        element.padding = `0 ${length}px 0 0`;
      }
      else if (placement.startsWith('right')) {
        element.padding = `0 0 0 ${length}px`;
      }
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

    if (placement === 'center') {
      element = { ...element, ...tooltipCentered };
    }

    return {
      ...tooltip,
      ...element,
    };
  }

  render() {
    const {
      handleClick,
      hideArrow,
      setTooltipRef,
    } = this.props;

    const output = {};

      output.content = <Container {...this.props} />;

    if (!hideArrow) {
      output.arrow = <Arrow {...this.props} />;
    }

    return (
      <div
        ref={setTooltipRef}
        className="__tooltip"
        style={this.tooltipStyle}
      >
        {output.content}
        {output.arrow}
      </div>
    );
  }
}
