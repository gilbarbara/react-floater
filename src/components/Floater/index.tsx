import * as React from 'react';

import STATUS from '../../status';

import { HandlerFunction, PlainObject, RenderProps, Statuses, Styles } from '../../types';

import Arrow from './Arrow';
import Container from './Container';

interface Props {
  arrowRef: React.Ref<HTMLSpanElement>;
  component?: React.FunctionComponent<RenderProps> | React.ReactElement;
  content?: React.ReactNode;
  disableAnimation: boolean;
  floaterRef: React.Ref<HTMLDivElement>;
  footer?: React.ReactNode;
  hideArrow: boolean;
  onClick: HandlerFunction;
  open?: boolean;
  placement: string;
  positionWrapper: boolean;
  showCloseButton?: boolean;
  status: Statuses;
  styles: Styles;
  title?: React.ReactNode;
}

export default class Floater extends React.PureComponent<Props> {
  private get style() {
    const { disableAnimation, component, placement, hideArrow, status, styles } = this.props;
    const {
      arrow: { length },
      floater,
      floaterCentered,
      floaterClosing,
      floaterOpening,
      floaterWithAnimation,
      floaterWithComponent,
    } = styles;
    let element: React.CSSProperties = {};

    if (!hideArrow) {
      if (placement.startsWith('top')) {
        element.padding = `0 0 ${length}px`;
      } else if (placement.startsWith('bottom')) {
        element.padding = `${length}px 0 0`;
      } else if (placement.startsWith('left')) {
        element.padding = `0 ${length}px 0 0`;
      } else if (placement.startsWith('right')) {
        element.padding = `0 0 0 ${length}px`;
      }
    }

    if (status === STATUS.OPENING || status === STATUS.OPEN) {
      element = { ...element, ...floaterOpening };
    }

    if (status === STATUS.CLOSING) {
      element = { ...element, ...floaterClosing };
    }

    if (status === STATUS.OPEN && !disableAnimation) {
      element = { ...element, ...floaterWithAnimation };
    }

    if (placement === 'center') {
      element = { ...element, ...floaterCentered };
    }

    if (component) {
      element = { ...element, ...floaterWithComponent };
    }

    return {
      ...floater,
      ...element,
    };
  }

  render(): JSX.Element {
    const { content, component, onClick: closeFn, floaterRef, hideArrow, status } = this.props;

    const output: PlainObject = {};
    const classes = ['__floater'];

    if (component) {
      if (React.isValidElement(component)) {
        output.content = React.cloneElement(component, { closeFn });
      } else {
        output.content = component({ closeFn });
      }
    } else {
      output.content = <Container {...this.props} content={content} />;
    }

    if (status === STATUS.OPEN) {
      classes.push('__floater__open');
    }

    if (!hideArrow) {
      output.arrow = <Arrow {...this.props} />;
    }

    return (
      <div ref={floaterRef} className={classes.join(' ')} style={this.style}>
        <div className="__floater__body">
          {output.content}
          {output.arrow}
        </div>
      </div>
    );
  }
}
