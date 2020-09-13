import * as React from 'react';
import is from 'is-lite';
import { HandlerFunction } from '../types';

interface Props {
  childRef: React.Ref<HTMLElement>;
  children: React.ReactNode;
  onClick: HandlerFunction<HTMLSpanElement>;
  onMouseEnter: HandlerFunction<HTMLSpanElement>;
  onMouseLeave: HandlerFunction<HTMLSpanElement>;
  style?: React.CSSProperties;
  styles: React.CSSProperties;
  wrapperRef: React.Ref<HTMLSpanElement>;
}

export default function ReactFloaterWrapper(props: Props): JSX.Element | null {
  const {
    childRef,
    children,
    onClick,
    onMouseEnter,
    onMouseLeave,
    style,
    styles,
    wrapperRef,
  } = props;
  let element;

  /* istanbul ignore else */
  if (children) {
    if (React.Children.count(children) === 1) {
      if (React.isValidElement(children)) {
        const refProp = is.function(children.type) ? 'innerRef' : 'ref';
        element = React.cloneElement(React.Children.only(children), {
          [refProp]: childRef,
        });
      } else {
        element = <span>{children}</span>;
      }
    } else {
      element = children;
    }
  }

  if (!element) {
    return null;
  }

  return (
    <span
      ref={wrapperRef}
      style={{ ...styles, ...style }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {element}
    </span>
  );
}
