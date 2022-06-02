import * as React from 'react';
import { AnyObject } from '@gilbarbara/types';
import { Instance, Placement } from '@popperjs/core';
import { ApplyStylesModifier } from '@popperjs/core/lib/modifiers/applyStyles';
import { ArrowModifier } from '@popperjs/core/lib/modifiers/arrow';
import { ComputeStylesModifier } from '@popperjs/core/lib/modifiers/computeStyles';
import { EventListenersModifier } from '@popperjs/core/lib/modifiers/eventListeners';
import { FlipModifier } from '@popperjs/core/lib/modifiers/flip';
import { HideModifier } from '@popperjs/core/lib/modifiers/hide';
import { OffsetModifier } from '@popperjs/core/lib/modifiers/offset';
import { PopperOffsetsModifier } from '@popperjs/core/lib/modifiers/popperOffsets';
import { PreventOverflowModifier } from '@popperjs/core/lib/modifiers/preventOverflow';
import { PartialDeep, RequireExactlyOne, ValueOf } from 'type-fest';

import { STATUS } from './literals';

export type Action = 'open' | 'close';
export type HandlerFunction<T = HTMLElement> = (event: React.SyntheticEvent<T>) => void;
export type PlacementOptions = Placement | 'center';
export type SelectorOrElement = string | null | HTMLElement;
export type Statuses = ValueOf<typeof STATUS>;

export interface LogOptions {
  data: AnyObject | any[];
  debug?: boolean;
  title: string;
  warn?: boolean;
}

export interface RenderProps {
  closeFn: HandlerFunction;
}

export interface BaseProps {
  /* Open the Floater automatically. */
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
  /* Log some actions. */
  debug?: boolean;
  /* Disable placement adjustments on scroll/resize. */
  disableFlip?: boolean;
  /* Disable the conversion of hover to click on mobile. */
  disableHoverToClick?: boolean;
  /* The event that will trigger the Floater. Unused in controlled mode. */
  event?: 'click' | 'hover';
  /* The amount of time (in seconds) that the floater should wait after a mouseLeave event before hiding. Only valid for event type hover  */
  eventDelay?: number;
  /* Anything that can be rendered. */
  footer?: React.ReactNode;
  /* The popper.js instance */
  getPopper?: (popper: Instance, origin: 'floater' | 'wrapper') => void;
  /* Hide the arrow. */
  hideArrow?: boolean;
  /* Used for the accessibility logic. Defaults to a randomly generated id. */
  id?: string;
  /* Customize popper.js modifiers. */
  modifiers?: PopperModifiers;
  /* The distance between the target and the Floater in pixels. */
  offset?: number;
  /* Controlled mode. */
  open?: boolean;
  /* The placement of the Floater. This will be updated automatically if there's no space available unless the "disableFlip" is set to true */
  placement?: PlacementOptions;
  /* A custom element to render the tooltip */
  portalElement?: SelectorOrElement;
  /* It will show a button to close the Floater. */
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
    placement?: Placement;
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

export interface PopperModifiers {
  applyStyles?: Partial<ApplyStylesModifier>;
  arrow?: Partial<ArrowModifier>;
  computeStyles?: Partial<ComputeStylesModifier>;
  eventListeners?: Partial<EventListenersModifier>;
  flip?: Partial<FlipModifier>;
  hide?: Partial<HideModifier>;
  offset?: Partial<OffsetModifier>;
  popperOffsets?: Partial<PopperOffsetsModifier>;
  preventOverflow?: Partial<PreventOverflowModifier>;
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
