import * as React from 'react';
import { PlainObject } from '@gilbarbara/types';
import is from 'is-lite';

import { STATUS } from '../literals';
import { useMount } from '../modules/hooks';
import { CloseFunction, Statuses } from '../types';

interface Props {
  childRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  id: string;
  isControlled: boolean;
  onClick: CloseFunction<HTMLSpanElement>;
  onMount: () => void;
  onMouseEnter: CloseFunction<HTMLSpanElement>;
  onMouseLeave: CloseFunction<HTMLSpanElement>;
  status: Statuses;
  style?: React.CSSProperties;
  styles: React.CSSProperties;
  wrapperRef: React.RefObject<HTMLElement>;
}

function FloaterWrapper(props: Props) {
  const {
    childRef,
    children,
    id,
    isControlled,
    onClick,
    onMount,
    onMouseEnter,
    onMouseLeave,
    status,
    style,
    styles,
    wrapperRef,
  } = props;

  useMount(() => {
    onMount();
  });

  let element;

  const mergedStyles = {
    ...styles,
    ...style,
    ...(React.isValidElement(children) ? children.props.style : undefined),
  };

  let wrapperProps: PlainObject = {
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
            {React.cloneElement(React.Children.only(children) as React.ReactElement, {
              innerRef: childRef,
              ...wrapperProps,
            })}
          </span>
        );
      } else {
        element = React.cloneElement(React.Children.only(children) as React.ReactElement, {
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

  return element ?? null;
}

export default React.memo(FloaterWrapper);
