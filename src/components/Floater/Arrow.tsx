import { CSSProperties, ReactNode, Ref } from 'react';

import { Styles } from '../../types';

interface Props {
  arrow?: ReactNode;
  arrowRef: Ref<HTMLSpanElement>;
  placement: string;
  styles: Styles;
}

export default function FloaterArrow(props: Props) {
  const { arrow, arrowRef, placement, styles } = props;
  const {
    arrow: { base, color, display, position, size },
  } = styles;
  const arrowStyles: CSSProperties = { display, position };

  let points;
  let x = base;
  let y = size;

  if (placement.startsWith('top')) {
    points = `0,0 ${x / 2},${y} ${x},0`;
  } else if (placement.startsWith('bottom')) {
    points = `${x},${y} ${x / 2},0 0,${y}`;
  } else if (placement.startsWith('left')) {
    y = base;
    x = size;
    points = `0,0 ${x},${y / 2} 0,${y}`;
  } else if (placement.startsWith('right')) {
    y = base;
    x = size;
    points = `${x},${y} ${x},0 0,${y / 2}`;
  }

  if (arrow) {
    return (
      <span
        ref={arrowRef}
        style={{
          color,
          height: placement.startsWith('left') || placement.startsWith('right') ? base : size,
          width: placement.startsWith('left') || placement.startsWith('right') ? size : base,
        }}
      >
        {arrow}
      </span>
    );
  }

  return (
    <span ref={arrowRef} className="__floater__arrow" style={arrowStyles}>
      <svg height={y} version="1.1" width={x} xmlns="http://www.w3.org/2000/svg">
        <polygon fill={color} points={points} />
      </svg>
    </span>
  );
}
