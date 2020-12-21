import * as React from 'react';

import { STATUS } from '../../literals';

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
  placement: string;
  positionWrapper: boolean;
  showCloseButton?: boolean;
  status: Statuses;
  styles: Styles;
  title?: React.ReactNode;
}

function Floater(props: Props): JSX.Element | null {
  const {
    component,
    content,
    disableAnimation,
    floaterRef,
    hideArrow,
    onClick: closeFn,
    placement,
    status,
    styles,
  } = props;

  const style = React.useMemo(() => {
    const {
      arrow: { length },
      floater,
      floaterCentered,
      floaterClosing,
      floaterOpening,
      floaterWithAnimation,
      floaterWithComponent,
    } = styles;
    let element: React.CSSProperties = { ...floater };

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

    if (status === STATUS.CLOSING) {
      element = { ...element, ...floaterClosing };
    }

    if (status === STATUS.OPENING || status === STATUS.OPEN) {
      element = { ...element, ...floaterOpening };
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

    return element;
  }, [component, disableAnimation, hideArrow, placement, status, styles]);

  const shouldRender = ['render', 'open', 'opening', 'closing'].some(d => d === status);

  const output: PlainObject = {};
  const classes = ['__floater'];

  if (component) {
    if (React.isValidElement(component)) {
      output.content = React.cloneElement(component, { closeFn });
    } else {
      output.content = component({ closeFn });
    }
  } else {
    output.content = <Container {...props} content={content} />;
  }

  if (status === STATUS.OPEN) {
    classes.push('__floater__open');
  }

  if (!hideArrow) {
    output.arrow = <Arrow {...props} />;
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div ref={floaterRef} className={classes.join(' ')} style={style}>
      <div className="__floater__body">
        {output.content}
        {output.arrow}
      </div>
    </div>
  );
}

export default React.memo(Floater);
