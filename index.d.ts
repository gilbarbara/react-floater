declare module 'react-floater' {
  import * as React from 'react';

  type Placement =
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

  type Action = 'open' | 'close';

  interface Options {
    arrow?: Object;
    computeStyle?: Object;
    flip?: Object;
    keepTogether?: Object;
    hide?: Object;
    inner?: Object;
    offset?: Object;
    preventOverflow?: Object;
    shift?: Object;
  }

  interface CallBackProps {
    action: Action;
    props: Props;
  }

  interface Props {
    /**
     * Open the Floater automatically.
     */
    autoOpen?: Boolean;
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
    component?: React.ReactNode;
    /**
     * The Floater content. It can be anything that can be rendered.
     * This is the only required props, unless you pass a component.
     */
    content: React.ReactNode;
    /**
     * Log some basic actions.
     */
    debug?: Boolean;
    /**
     * Animate the Floater on scroll/resize.
     */
    disableAnimation?: Boolean;
    /**
     * Disable changes in the Floater position on scroll/resize.
     */
    disableFlip?: Boolean;
    /**
     * Don't convert hover event to click on mobile.
     */
    disableHoverToClick?: Boolean;
    /**
     * The event that will trigger the Floater. It can be hover | click.
     * These won't work in controlled mode.
     */
    event?: String;
    /**
     * The amount of time (in seconds) that the floater should wait after a mouseLeave event before hiding. Only valid for event type hover.
     */
    eventDelay?: Number;
    /**
     * It can be anything that can be rendered.
     */
    footer?: React.ReactNode;
    /**
     * Get the pooper.js instance
     */
    getPopper?: Function;
    /**
     * Don't show the arrow. Useful for centered or modal layout.
     */
    hideArrow?: Boolean;
    /**
     * In case that you need to identify the portal.
     */
    id?: String | Number;
    isPositioned?: Boolean;
    /**
     * The distance between the Floater and its target in pixels.
     */
    offset?: Number;
    /**
     * The switch between normal and controlled modes.
     */
    open?: Boolean;
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
    showCloseButton?: Boolean;
    style?: Object;
    /**
     * Customize the default UI.
     */
    styles?: Object;
    /**
     * The target used to calculate the Floater position. If it's not set, it will use the `children` as the target.
     */
    target?: String | Object;
    /**
     * It can be anything that can be rendered.
     */
    title?: React.ReactNode;
    /**
     * Position the wrapper relative to the target.
     */
    wrapperOptions?: Object;
  }

  export default class Joyride extends React.Component<Props> {
    constructor(props: Props);

    static defaultProps: Props;
  }
}
