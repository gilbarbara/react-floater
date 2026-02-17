import {
  CSSProperties,
  FunctionComponent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react';

import { STATUS } from '../literals';

import { PopperInstance, PopperModifiers, PopperPlacement } from './popper';
import { PartialDeep, RequireExactlyOne, ValueOf } from './utilities';

export type Action = 'open' | 'close';
export type CloseFunction<T = HTMLElement> = MouseEventHandler<T>;
export type FloaterComponent<T = CustomComponentProps> = FunctionComponent<T> | ReactElement<T>;
export type Placement = PopperPlacement | 'center';
export type Props = RequireExactlyOne<BaseProps, 'content' | 'component'>;

export type SelectorOrElement = string | null | HTMLElement;

export type Statuses = ValueOf<typeof STATUS>;

export interface BaseProps {
  /**
   * A custom arrow for the Floater.
   */
  arrow?: ReactNode;
  /**
   * Open the Floater automatically.
   * @default false
   */
  autoOpen?: boolean;
  /* It will be called when the Floater change state */
  callback?: (action: Action, props: Props) => void;
  /* The element to have the Floater. */
  children?: ReactNode;
  /**
   * A React element or function to be used as the custom UI for the Floater.
   * The prop closeFloater will be available in your component.
   */
  component: FloaterComponent;
  /* Anything that can be rendered. */
  content: ReactNode;
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
  footer?: ReactNode;
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
  placement?: Placement;
  /* A custom element to render the tooltip */
  portalElement?: SelectorOrElement;
  /**
   * Show a button to close the Floater.
   * @default false
   */
  showCloseButton?: boolean;
  style?: CSSProperties;
  /* Customize the UI. */
  styles?: PartialDeep<Styles>;
  /* The target for the Floater positioning. If it's not set, it will use the `children` as the target. */
  target?: SelectorOrElement;
  /* Anything that can be rendered. */
  title?: ReactNode;
  /* Position the wrapper relative to the target. */
  wrapperOptions?: {
    offset?: number;
    placement?: PopperPlacement;
    position?: boolean;
  };
}

export interface CustomComponentProps {
  closeFn: CloseFunction;
}

export interface LogOptions {
  data: any;
  debug?: boolean;
  title: string;
}

export interface State {
  currentPlacement: Placement;
  positionWrapper: boolean;
  status: Statuses;
  statusWrapper: Statuses;
}

export interface Styles {
  arrow: CSSProperties & {
    /**
     * The distance from the tip of the arrow to the edge of the Floater.
     */
    base: number;
    /**
     * The width of the base of the arrow.
     */
    size: number;
  };
  close: CSSProperties;
  container: CSSProperties;
  content: CSSProperties;
  floater: CSSProperties;
  floaterCentered: CSSProperties;
  floaterClosing: CSSProperties;
  floaterOpening: CSSProperties;
  floaterWithAnimation: CSSProperties;
  floaterWithComponent: CSSProperties;
  footer: CSSProperties;
  options: {
    zIndex: number;
  };
  title: CSSProperties;
  wrapper: CSSProperties;
  wrapperPosition: CSSProperties;
}

declare global {
  interface Window {
    ReactFloaterDebug?: boolean;
  }
}
