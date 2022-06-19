import * as React from 'react';
import { PartialDeep, RequireExactlyOne, ValueOf } from 'type-fest';

import { PopperInstance, PopperModifiers, PopperPlacement } from './popper';

import { STATUS } from '../literals';

export type Action = 'open' | 'close';
export type HandlerFunction<T = HTMLElement> = (event: React.SyntheticEvent<T>) => void;
export type PlacementOptions = PopperPlacement | 'center';
export type PlainObject<T = any> = Record<string, T>;
export type SelectorOrElement = string | null | HTMLElement;
export type Statuses = ValueOf<typeof STATUS>;

export interface LogOptions {
  data: any;
  debug?: boolean;
  title: string;
}

export interface RenderProps {
  closeFn: HandlerFunction;
}

export interface BaseProps {
  /**
   * Open the Floater automatically.
   * @default false
   */
  autoOpen?: boolean;
  /* It will be called when the Floater change state */
  callback?: (action: Action, props: Props) => void;
  /* The element to have the Floater. */
  children?: React.ReactNode;
  /**
   * A React element or function to be used as the custom UI for the Floater.
   * The prop closeFloater will be available in your component.
   */
  component: React.FunctionComponent<RenderProps> | React.ReactElement;
  /* Anything that can be rendered. */
  content: React.ReactNode;
  /**
   * Log some actions.
   * @default false
   */
  debug?: boolean;
  /**
   * Disable placement adjustments on scroll/resize.
   * @default false
   */
  disableFlip?: boolean;
  /**
   * Disable the conversion of hover to click on mobile.
   * @default false
   */
  disableHoverToClick?: boolean;
  /**
   * The event type that will trigger the Floater.
   * Unused in controlled mode.
   * @default click
   */
  event?: 'click' | 'hover';
  /**
   *  The amount of time (in seconds) that the floater should wait after a mouseLeave event before hiding.
   *  Only valid for event type hover.
   *  @default 0.4
   *  */
  eventDelay?: number;
  /* Anything that can be rendered. */
  footer?: React.ReactNode;
  /* The popper.js instance */
  getPopper?: (popper: PopperInstance, origin: 'floater' | 'wrapper') => void;
  /**
   * Hide the arrow.
   * @default false
   */
  hideArrow?: boolean;
  /* Used for the accessibility logic. Defaults to a randomly generated id. */
  id?: string;
  /* Customize popper.js modifiers. */
  modifiers?: PopperModifiers;
  /**
   * The distance between the target and the Floater in pixels.
   * @default 15
   */
  offset?: number;
  /* Controlled mode. */
  open?: boolean;
  /**
   * The placement of the Floater
   * This will be updated automatically if there's no space available unless the "disableFlip" is set to true
   * @default bottom
   */
  placement?: PlacementOptions;
  /* A custom element to render the tooltip */
  portalElement?: SelectorOrElement;
  /**
   * Show a button to close the Floater.
   * @default false
   */
  showCloseButton?: boolean;
  style?: React.CSSProperties;
  /* Customize the UI. */
  styles?: PartialDeep<Styles>;
  /* The target for the Floater positioning. If it's not set, it will use the `children` as the target. */
  target?: SelectorOrElement;
  /* Anything that can be rendered. */
  title?: React.ReactNode;
  /* Position the wrapper relative to the target. */
  wrapperOptions?: {
    offset?: number;
    placement?: PopperPlacement;
    position?: boolean;
  };
}

export type Props = RequireExactlyOne<BaseProps, 'content' | 'component'>;

export interface State {
  currentPlacement: PlacementOptions;
  positionWrapper: boolean;
  status: Statuses;
  statusWrapper: Statuses;
}

export interface CustomComponent {
  children?: React.ReactNode;
  closeFn: HandlerFunction;
}

export interface Styles {
  arrow: React.CSSProperties & {
    length: number;
    spread: number;
  };
  close: React.CSSProperties;
  container: React.CSSProperties;
  content: React.CSSProperties;
  floater: React.CSSProperties;
  floaterCentered: React.CSSProperties;
  floaterClosing: React.CSSProperties;
  floaterOpening: React.CSSProperties;
  floaterWithAnimation: React.CSSProperties;
  floaterWithComponent: React.CSSProperties;
  footer: React.CSSProperties;
  options: {
    zIndex: number;
  };
  title: React.CSSProperties;
  wrapper: React.CSSProperties;
  wrapperPosition: React.CSSProperties;
}

declare global {
  interface Window {
    ReactFloaterDebug?: boolean;
  }
}

export * from './popper';
