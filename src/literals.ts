export const POSITIONING_PROPS = ['position', 'top', 'right', 'bottom', 'left'] as const;

export const STATUS = {
  INIT: 'init',
  IDLE: 'idle',
  RENDER: 'render',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing',
  ERROR: 'error',
} as const;
