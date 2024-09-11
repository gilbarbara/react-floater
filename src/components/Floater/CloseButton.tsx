import * as React from 'react';

import { CloseFunction } from '../../types';

interface Props {
  onClick: CloseFunction<HTMLButtonElement>;
  styles: React.CSSProperties;
}

export default function FloaterCloseButton({ onClick, styles }: Props) {
  const { color, height, width, ...style } = styles;

  return (
    <button aria-label="close" onClick={onClick} style={style} type="button">
      <svg
        height={`${height}px`}
        preserveAspectRatio="xMidYMid"
        version="1.1"
        viewBox="0 0 18 18"
        width={`${width}px`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="M8.13911129,9.00268191 L0.171521827,17.0258467 C-0.0498027049,17.248715 -0.0498027049,17.6098394 0.171521827,17.8327545 C0.28204354,17.9443526 0.427188206,17.9998706 0.572051765,17.9998706 C0.71714958,17.9998706 0.862013139,17.9443526 0.972581703,17.8327545 L9.0000937,9.74924618 L17.0276057,17.8327545 C17.1384085,17.9443526 17.2832721,17.9998706 17.4281356,17.9998706 C17.5729992,17.9998706 17.718097,17.9443526 17.8286656,17.8327545 C18.0499901,17.6098862 18.0499901,17.2487618 17.8286656,17.0258467 L9.86135722,9.00268191 L17.8340066,0.973848225 C18.0553311,0.750979934 18.0553311,0.389855532 17.8340066,0.16694039 C17.6126821,-0.0556467968 17.254037,-0.0556467968 17.0329467,0.16694039 L9.00042166,8.25611765 L0.967006424,0.167268345 C0.745681892,-0.0553188426 0.387317931,-0.0553188426 0.165993399,0.167268345 C-0.0553311331,0.390136635 -0.0553311331,0.751261038 0.165993399,0.974176179 L8.13920499,9.00268191 L8.13911129,9.00268191 Z"
            fill={color}
          />
        </g>
      </svg>
    </button>
  );
}
