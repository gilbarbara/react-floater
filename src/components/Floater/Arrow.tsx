import * as React from 'react';

import { Styles } from '../../types';

interface Props {
  arrowRef: React.Ref<HTMLSpanElement>;
  placement: string;
  styles: Styles;
}

function FloaterArrow(props: Props): JSX.Element {
  const { arrowRef, placement, styles } = props;

  const {
    arrow: { color, display, length, position, spread },
  } = styles;
  const arrowStyles: React.CSSProperties = { display, position };

  let points;
  let x = spread;
  let y = length;

  /* istanbul ignore else */
  if (placement.startsWith('top')) {
    points = `0,0 ${x / 2},${y} ${x},0`;
  } else if (placement.startsWith('bottom')) {
    points = `${x},${y} ${x / 2},0 0,${y}`;
  } else if (placement.startsWith('left')) {
    y = spread;
    x = length;
    points = `0,0 ${x},${y / 2} 0,${y}`;
  } else if (placement.startsWith('right')) {
    y = spread;
    x = length;
    points = `${x},${y} ${x},0 0,${y / 2}`;
  }

  return (
    <span ref={arrowRef} className="__floater__arrow" style={arrowStyles}>
      <svg height={y} version="1.1" width={x} xmlns="http://www.w3.org/2000/svg">
        <polygon fill={color} points={points} />
      </svg>
    </span>
  );
}

export default FloaterArrow;
