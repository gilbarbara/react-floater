import * as React from 'react';
import { AnyObject } from '@gilbarbara/types';
import is from 'is-lite';

import { STATUS } from '../literals';
import { HandlerFunction, Statuses } from '../types';

interface Props {
  childRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  id: string;
  isControlled: boolean;
  onClick: HandlerFunction<HTMLSpanElement>;
  onMouseEnter: HandlerFunction<HTMLSpanElement>;
  onMouseLeave: HandlerFunction<HTMLSpanElement>;
  status: Statuses;
  style?: React.CSSProperties;
  styles: React.CSSProperties;
  wrapperRef: React.RefObject<HTMLElement>;
}

function FloaterWrapper(props: Props): JSX.Element | null {
  const {
    childRef,
    children,
    id,
    isControlled,
    onClick,
    onMouseEnter,
    onMouseLeave,
    status,
    style,
    styles,
    wrapperRef,
  } = props;
  let element;

  const mergedStyles = React.useMemo(() => {
    return {
      ...styles,
      ...style,
      ...(React.isValidElement(children) ? children.props.style : undefined),
    };
  }, [children, style, styles]);

  let wrapperProps: AnyObject = {
    'aria-describedby': ([STATUS.OPENING, STATUS.OPEN, STATUS.CLOSING] as Statuses[]).includes(
      status,
    )
      ? id
      : undefined,
    'data-id': id,
    style: mergedStyles,
  };

  if (!isControlled) {
    wrapperProps = {
      ...wrapperProps,
      onClick,
      onMouseEnter,
      onMouseLeave,
    };
  }

  /* istanbul ignore else */
  if (children) {
    if (
      React.Children.count(children) === 1 &&
      React.isValidElement(children) &&
      children.type !== React.Fragment
    ) {
      // eslint-disable-next-line unicorn/prefer-ternary
      if (is.function(children.type)) {
        element = (
          <span ref={wrapperRef}>
            {React.cloneElement(React.Children.only(children), {
              innerRef: childRef,
              ...wrapperProps,
            })}
          </span>
        );
      } else {
        element = React.cloneElement(React.Children.only(children), {
          ref: wrapperRef,
          ...wrapperProps,
        });
      }
    } else {
      element = (
        <span ref={wrapperRef} {...wrapperProps}>
          {children}
        </span>
      );
    }
  }

  return element || null;
}

export default React.memo(FloaterWrapper);
