import * as React from 'react';
import is from 'is-lite';
import { HandlerFunction, PlainObject, Statuses } from '../types';
import { STATUS } from '../literals';

interface Props {
  childRef: React.Ref<HTMLElement>;
  children: React.ReactNode;
  id: string;
  isControlled: boolean;
  onClick: HandlerFunction<HTMLSpanElement>;
  onMouseEnter: HandlerFunction<HTMLSpanElement>;
  onMouseLeave: HandlerFunction<HTMLSpanElement>;
  status: Statuses;
  style?: React.CSSProperties;
  styles: React.CSSProperties;
  wrapperRef: React.Ref<HTMLSpanElement>;
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

  let wrapperProps: PlainObject = {
    'aria-describedby': [STATUS.OPENING, STATUS.OPEN, STATUS.CLOSING].some(d => d === status)
      ? id
      : undefined,
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
    if (React.Children.count(children) === 1 && React.isValidElement(children)) {
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
