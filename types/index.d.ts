import * as React from 'react';

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'auto'
  | 'center';

export type Action = 'open' | 'close';

export interface Options {
  arrow?: object;
  computeStyle?: object;
  flip?: object;
  keepTogether?: object;
  hide?: object;
  inner?: object;
  offset?: object;
  preventOverflow?: object;
  shift?: object;
}

export interface CallBackProps {
  action: Action;
  props: Props;
}

export interface RenderProps {
  closeFn: () => void;
}

export interface Props {
  /**
   * Open the Floater automatically.
   */
  autoOpen?: boolean;
  /**
   * It will be called when the Floater change state
   */
  callback?: () => CallBackProps;
  /**
   * An element to trigger the Floater.
   */
  children?: React.ReactNode;
  /**
   * A React component or function to as a custom UI for the Floater.
   * The prop closeFloater will be available in your component.
   */
  component?: (renderProps: RenderProps) => React.ReactNode;
  /**
   * The Floater content. It can be anything that can be rendered.
   * This is the only required props, unless you pass a component.
   */
  content: React.ReactNode;
  /**
   * Log some basic actions.
   */
  debug?: boolean;
  /**
   * Animate the Floater on scroll/resize.
   */
  disableAnimation?: boolean;
  /**
   * Disable changes in the Floater position on scroll/resize.
   */
  disableFlip?: boolean;
  /**
   * Don't convert hover event to click on mobile.
   */
  disableHoverToClick?: boolean;
  /**
   * The event that will trigger the Floater. It can be hover | click.
   * These won't work in controlled mode.
   */
  event?: string;
  /**
   * The amount of time (in seconds) that the floater should wait after a mouseLeave event before hiding. Only valid for event type hover.
   */
  eventDelay?: number;
  /**
   * It can be anything that can be rendered.
   */
  footer?: React.ReactNode;
  /**
   * Get the pooper.js instance
   */
  getPopper?: () => void;
  /**
   * Don't show the arrow. Useful for centered or modal layout.
   */
  hideArrow?: boolean;
  /**
   * In case that you need to identify the portal.
   */
  id?: string | number;
  isPositioned?: boolean;
  /**
   * The distance between the Floater and its target in pixels.
   */
  offset?: number;
  /**
   * The switch between normal and controlled modes.
   */
  open?: boolean;
  /**
   * Customize popper.js modifiers.
   */
  options?: Options;
  /**
   * The placement of the Floater. It will update the position if there's no space available.
   */
  placement?: Placement;
  /**
   * It will show a ⨉ button to close the Floater.
   */
  showCloseButton?: boolean;
  style?: object;
  /**
   * Customize the default UI.
   */
  styles?: object;
  /**
   * The target used to calculate the Floater position. If it's not set, it will use the `children` as the target.
   */
  target?: string | object;
  /**
   * It can be anything that can be rendered.
   */
  title?: React.ReactNode;
  /**
   * Position the wrapper relative to the target.
   */
  wrapperOptions?: object;
}

export default class ReactFloater extends React.Component<Props> {}
