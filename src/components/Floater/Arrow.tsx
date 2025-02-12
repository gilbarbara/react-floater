import * as React from 'react';

import { Styles } from '../../types';

interface Props {
  arrowRef: React.Ref<HTMLSpanElement>;
  placement: string;
  styles: Styles;
}

/**
 * FloaterArrow component renders a customizable arrow for tooltips/popovers
 * @param props Component properties
 * @returns React component
 */
export default function FloaterArrow(props: Props) {
  const { arrowRef, placement, styles } = props;
  const {
    arrow: { color, display, length, position, rounded, spread },
  } = styles;

  const [direction] = placement.split('-');
  const isVertical = direction === 'top' || direction === 'bottom';

  const arrowStyles: React.CSSProperties = { display, position };

  const baseRadius = isVertical ? spread / 8 : length / 8;
  const r = rounded ? baseRadius : 0;

  const webkitMask = isVertical
    ? `linear-gradient(0deg,#0000 calc(${r}px/sqrt(2)),#000 0),
       radial-gradient(${r}px at 50% calc(100% - ${r}px*sqrt(2)),#000 98%,#0000 101%)`
    : `linear-gradient(-90deg,#0000 calc(${r}px/sqrt(2)),#000 0),
       radial-gradient(${r}px at calc(100% - ${r}px*sqrt(2)) 50%,#000 98%,#0000 101%)`;

  const clipPath = isVertical ? 'polygon(50% 100%,100% 0,0 0)' : 'polygon(100% 50%,0 100%,0 0)';

  let scales: string | undefined;

  if (direction === 'bottom') {
    scales = '1 -1';
  } else if (direction === 'right') {
    scales = '-1 1';
  }

  return (
    <span
      ref={arrowRef}
      className="__floater__arrow"
      style={{
        ...arrowStyles,
        backgroundColor: color,
        height: `${isVertical ? length : spread}px`,
        width: `${isVertical ? spread : length}px`,
        WebkitMask: rounded ? webkitMask : 'none',
        clipPath,
        scale: scales,
      }}
    />
  );
}
