import {
  Children,
  cloneElement,
  CSSProperties,
  Fragment,
  isValidElement,
  memo,
  ReactElement,
  ReactNode,
  RefObject,
} from 'react';
import { PlainObject } from '@gilbarbara/types';
import is from 'is-lite';

import { STATUS } from '../literals';
import { useMount } from '../modules/hooks';
import { CloseFunction, Statuses } from '../types';

interface Props {
  childRef: RefObject<HTMLElement>;
  children: ReactNode;
  id: string;
  isControlled: boolean;
  onClick: CloseFunction<HTMLSpanElement>;
  onMount: () => void;
  onMouseEnter: CloseFunction<HTMLSpanElement>;
  onMouseLeave: CloseFunction<HTMLSpanElement>;
  status: Statuses;
  style?: CSSProperties;
  styles: CSSProperties;
  wrapperRef: RefObject<HTMLElement>;
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

  let element: ReactElement | null = null;

  const mergedStyles = {
    ...styles,
    ...style,
    ...(isValidElement(children) ? children.props.style : undefined),
  };

  const wrapperId = `${id}-wrapper`;
  let wrapperProps: PlainObject = {
    'aria-describedby': ([STATUS.OPENING, STATUS.OPEN, STATUS.CLOSING] as Statuses[]).includes(
      status,
    )
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

  if (children) {
    if (Children.count(children) === 1 && isValidElement(children) && children.type !== Fragment) {
      element = is.function(children.type) ? (
        <span ref={wrapperRef} id={wrapperId} {...wrapperProps}>
          {cloneElement(Children.only(children) as ReactElement, {
            innerRef: childRef,
          })}
        </span>
      ) : (
        cloneElement(Children.only(children) as ReactElement, {
          id: wrapperId,
          ref: wrapperRef,
          ...wrapperProps,
        })
      );
    } else {
      element = (
        <span ref={wrapperRef} id={wrapperId} {...wrapperProps}>
          {children}
        </span>
      );
    }
  }

  return element;
}

export default memo(FloaterWrapper);
