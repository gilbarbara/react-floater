import * as React from 'react';
import { AnyObject } from '@gilbarbara/types';

import Arrow from './Arrow';
import Container from './Container';

import { STATUS } from '../../literals';
import { HandlerFunction, RenderProps, Statuses, Styles } from '../../types';

interface Props {
  arrowRef: React.Ref<HTMLSpanElement>;
  component?: React.FunctionComponent<RenderProps> | React.ReactElement;
  content?: React.ReactNode;
  floaterRef: React.Ref<HTMLDivElement>;
  footer?: React.ReactNode;
  hideArrow: boolean;
  id: string;
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
    floaterRef,
    hideArrow,
    id,
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

    if (placement === 'center') {
      element = { ...element, ...floaterCentered };
    }

    if (component) {
      element = { ...element, ...floaterWithComponent };
    }

    return element;
  }, [component, hideArrow, placement, status, styles]);

  const shouldRender = ['render', 'open', 'opening', 'closing'].includes(status);

  const output: AnyObject = {};
  const classes = ['__floater'];
  const baseProps = { id, role: 'tooltip' };

  if (component) {
    const componentProps = { closeFn, ...baseProps };

    output.content = React.isValidElement(component)
      ? React.cloneElement(component, componentProps)
      : component(componentProps);
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
    <div ref={floaterRef} style={{ zIndex: styles.options.zIndex }}>
      <div className={classes.join(' ')} style={style} {...baseProps}>
        <div className="__floater__body">
          {output.content}
          {output.arrow}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Floater);
