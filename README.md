# React Floater

[![NPM version](https://badge.fury.io/js/react-floater.svg)](https://www.npmjs.com/package/react-floater) [![CI](https://github.com/gilbarbara/react-floater/actions/workflows/main.yml/badge.svg)](https://github.com/gilbarbara/react-floater/actions/workflows/main.yml) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=gilbarbara_react-floater&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=gilbarbara_react-floater) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=gilbarbara_react-floater&metric=coverage)](https://sonarcloud.io/summary/new_code?id=gilbarbara_react-floater)

Advanced tooltips for React!

View the [demo](https://codesandbox.io/s/github/gilbarbara/react-floater/tree/main/demo)

## Highlights

- 🏖 **Easy to use:** Just set the `content`
- 🛠 **Flexible:** Personalize the options to fit your needs
- 🟦 **Typescript:** Nicely typed

## Usage

```shell
npm install react-floater
```

Import it in your app:

```tsx
import Floater from 'react-floater';

<Floater content="This is the Floater content">
  <span>click me</span>
</Floater>;
```

And voíla!

## Customization

You can use a custom component to render the Floater with the `component` prop.  
Check `WithStyledComponents.ts` in the [demo](https://codesandbox.io/s/github/gilbarbara/react-floater/tree/main/demo) for an example.

## Props

**autoOpen**  `boolean` ▶︎ false  
Open the Floater automatically.

**callback** `(action: 'open' | 'close', props: Props) => void`  
It will be called when the Floater changes state.

**children** `ReactNode`  
An element to trigger the Floater.

**component** `ComponentType | ReactElement`  
A React element or function to use as a custom UI for the Floater.  
The prop `closeFn` will be available in your component.

**content** `ReactNode`  
The Floater content. It can be anything that can be rendered.  
_This is required unless you pass a_ `component`.

**debug** `boolean` ▶︎ false  
Log some basic actions.  
_You can also set a global variable_ `ReactFloaterDebug = true;`

**disableFlip** `boolean` ▶︎ false  
Disable changes in the Floater position on scroll/resize.

**disableHoverToClick** `boolean` ▶︎ false  
Don't convert the _hover_ event to _click_ on mobile.

**event** `'hover' | 'click'` ▶︎ click  
The event that will trigger the Floater.

> This won't work in a controlled mode.

**eventDelay** `number` ▶︎ 0.4  
The amount of time (in seconds) the floater should wait after a `mouseLeave` event before hiding.  
> Only valid for event type `hover`.

**footer** `ReactNode`  
It can be anything that can be rendered.

**getPopper** `(popper: PopperInstance, origin: 'floater' | 'wrapper') => void`  
Get the popper.js instance.

**hideArrow** `boolean` ▶︎ false  
Don't show the arrow. Useful for centered or modal layout.

**offset** `number` ▶︎ 15  
The distance between the Floater and its target in pixels.

**open** `boolean`  
The switch between normal and controlled modes.  
> Setting this prop will disable normal behavior.

**modifiers** `PopperModifiers`  
Customize popper.js modifiers.  

<details>
  <summary>Type Definition</summary>

```typescript
interface PopperModifiers {
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
```

</details>

> Don't use it unless you know what you're doing

**placement** `Placement` ▶︎ `bottom`  
The placement of the Floater. It will update the position if there's no space available.

<details>
  <summary>Type Definition</summary>

```typescript
type Placement = 
| "auto" | "auto-start" | "auto-end"
| "top" | "top-start" | "top-end"
| "bottom" | "bottom-start" | "bottom-end"
| "right"| "right-start" | "right-end"
| "left" | "left-start" | "left-end"
| "center"
```

</details>

**portalElement** `string|HTMLElement`  
A css selector or element to render the tooltips

**showCloseButton** `boolean` ▶︎ false  
It will show a ⨉ button to close the Floater.  
This will be `true` when you change the `wrapperOptions` position.

**styles** `Styles`  
Customize the UI.

<details>
  <summary>Type Definition</summary>

```typescript
interface Styles {
  arrow: CSSProperties & {
    length: number;
    spread: number;
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
```

</details>

**target** `string | HTMLElement`  
The target element to calculate the Floater position. It will use the children as the target if it's not set.

**title** `ReactNode`  
It can be anything that can be rendered.

**wrapperOptions** `WrapperOptions`  
Position the wrapper relative to the target.  
_You need to set a `target` for this to work._

<details>
  <summary>Type Definition</summary>

```typescript
interface WrapperOptions {
  offset: number; // The distance between the wrapper and the target. It can be a negative value.
  placement: string; // the same options as above, except center
  position: bool; // Set to true to position the wrapper
}
```

</details>

## Styling

You can customize everything with the `styles` prop.  
Only set the properties you want to change, and the default styles will be merged.

Check the [styles.ts](src/modules/styles.ts) for the syntax.

## Modes

**Default**  
The wrapper will trigger the events and use itself as the Floater's target.

```tsx
<Floater content="This is the Floater content">
  <span>click me</span>
</Floater>
```

**Proxy**  
The wrapper will trigger the events, but the Floater will use the **target** prop to position itself.

```tsx
<div className="App">
  <img src="some-path" />

  <Floater content="This is the Floater content" target=".App img">
    <span>click me</span>
  </Floater>
</div>
```

**Beacon**  
It is the same as the **proxy mode,** but the wrapper will be positioned relative to the `target`.

```tsx
<div className="App">
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png"
    width="100"
    className="my-super-image"
  />

  <Floater
    content="This is the Floater content"
    target=".my-super-image"
    wrapperOptions={{
      offset: -22,
      placement: 'top',
      position: true,
    }}
  >
    <span style={{ color: '#f04', fontSize: 34 }}>◉</span>
  </Floater>
</div>
```

**Controlled**  
Setting a boolean to the open prop will enter the controlled mode and not respond to events.  
In this mode, you don't even need to have `children`

```tsx
<div className="App">
  <img src="some-path" />
  <Floater content="This is the Floater content" open={true} target=".App img" />
</div>
```
