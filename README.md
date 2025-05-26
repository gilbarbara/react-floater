# React Floater

[![NPM version](https://badge.fury.io/js/react-floater.svg)](https://www.npmjs.com/package/react-floater) [![CI](https://github.com/gilbarbara/react-floater/actions/workflows/main.yml/badge.svg)](https://github.com/gilbarbara/react-floater/actions/workflows/main.yml) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=gilbarbara_react-floater&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=gilbarbara_react-floater) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=gilbarbara_react-floater&metric=coverage)](https://sonarcloud.io/summary/new_code?id=gilbarbara_react-floater)

**Flexible, customizable, and accessible tooltips, popovers, and guided hints for React.**

[**View the live demo →**](https://codesandbox.io/s/github/gilbarbara/react-floater/tree/main/demo)

## Highlights

- 🏖 **Easy to use:** Just set the `content`
- 🛠 **Flexible:** Personalize the options to fit your needs
- 🟦 **Type-safe:** Full TypeScript support

## Usage

```shell
npm install react-floater
```

Import it into your app:

```tsx
import Floater from 'react-floater';

<Floater content="This is the Floater content">
  <span>click me</span>
</Floater>;
```

Voilà! A tooltip will appear on click!

## Customization & Styling

React Floater is highly customizable. You can:

- Use a custom component for the content via the `component` prop  
  (see `WithStyledComponents.ts` in the [demo](https://codesandbox.io/s/github/gilbarbara/react-floater/tree/main/demo)).
- Pass a custom arrow using the `arrow` prop.
- Customize the UI appearance using the `styles` prop.  
  You only need to provide the keys you want to override—defaults will be merged automatically.

```tsx
<Floater
  content={<div>Custom content <b>with bold!</b></div>}
  placement="right"
  arrow={<MyCustomArrow />}
  styles={{
    container: { backgroundColor: "#222", color: "#fff" },
    arrow: { color: "#222", length: 16, spread: 24 },
  }}
>
  <button>Hover or click me</button>
</Floater>
```
For all available style keys and their default values, see the [styles.ts](src/modules/styles.ts) source.

## Props

| **Prop**            | **Type**                                                     | **Default** | **Description**                                              |
|---------------------| ------------------------------------------------------------ | ----------- | ------------------------------------------------------------ |
| arrow ✨              | ReactNode                                                    | –           | Custom arrow for the floater. [See styles.arrow](#styles-type-definition) |
| autoOpen            | boolean                                                      | false       | Open the Floater automatically.                              |
| callback            | (action: ‘open’ \| ‘close’, props: Props) => void            | –           | Called when the Floater opens or closes.                     |
| children            | ReactNode                                                    | –           | Element to trigger the Floater.                              |
| component           | ComponentType \| ReactElement                                | –           | Custom component UI for the Floater. Has access to closeFn.  |
| content             | ReactNode                                                    | –           | The content of the Floater. (Required unless you pass a component.) |
| debug               | boolean                                                      | false       | Log basic actions.                                           |
| disableFlip         | boolean                                                      | false       | Disable changes in position on scroll/resize.                |
| disableHoverToClick | boolean                                                      | false       | Don’t convert hover to click on mobile.                      |
| event               | 'hover' \| 'click'                                           | 'click'     | Event that triggers the Floater.*Not used in controlled mode.* |
| eventDelay          | number                                                       | 0.4         | Time in seconds before hiding on mouseLeave (only for hover). |
| footer              | ReactNode                                                    | –           | Footer area content.                                         |
| getPopper           | (popper: PopperInstance, origin: ‘floater’ \| ‘wrapper’) => void | –           | Get the popper.js instance.                                  |
| hideArrow           | boolean                                                      | false       | Hide the arrow (good for centered/modal).                    |
| offset              | number                                                       | 15          | Distance (px) between Floater and target.                    |
| open                | boolean                                                      | –           | Switch to controlled mode. Disables normal event triggers.   |
| modifiers           | [PopperModifiers](#poppermodifiers-type-definition)          | –           | Customize popper.js modifiers.                               |
| placement           | [Placement](#placement-type-definition)                      | 'bottom'    | Floater’s position.                                          |
| portalElement       | string \| HTMLElement                                        | –           | Selector or element for rendering.                           |
| showCloseButton     | boolean                                                      | false       | Shows a close (×) button.                                    |
| styles              | [Styles](#styles-type-definition)                            | –           | Customize UI styles.                                         |
| target              | string \| HTMLElement                                        | –           | Target element for position. Defaults to children.           |
| title               | ReactNode                                                    | –           | Floater title.                                               |
| wrapperOptions      | [WrapperOptions](#wrapperoptions-type-definition)            | –           | Options for positioning the wrapper. Requires a target.      |

<details>
	<summary><b id="poppermodifiers-type-definition">PopperModifiers Type Definition</b></summary>

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

> **Intended for advanced customization—use with caution.**

<details>
<summary><b id="placement-type-definition">Placement Type Definition</b></summary>

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


<details>
<summary><b id="styles-type-definition">Styles Type Definition</b></summary>

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

<details>
  <summary><b id="wrapperoptions-type-definition">WrapperOptions Type Definition</b></summary>

```typescript
interface WrapperOptions {
  offset: number; // The distance between the wrapper and the target. It can be a negative value.
  placement: string; // the same options as above, except center
  position: boolean; // Set to true to position the wrapper
}
```

</details>

## Modes

React Floater supports several modes for flexible positioning and control:

**Default**  
The Floater is anchored to its child and triggers on event.

```tsx
<Floater content="This is the Floater content">
  <span>click me</span>
</Floater>
```

**Proxy**  
The Floater is triggered by the child, but positioned relative to the `target`.

```tsx
<div className="App">
  <img src="some-path" />

  <Floater content="This is the Floater content" target=".App img">
    <span>click me</span>
  </Floater>
</div>
```

**Beacon**  
The Floater wrapper is positioned relative to the target (useful for guided tours or beacons).

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
You manage the Floater’s visibility with the `open` prop - no trigger events are needed.
In this mode, you don't even need to have `children`

```tsx
<div className="App">
  <img src="some-path" />
  <Floater content="This is the Floater content" open={true} target=".App img" />
</div>
```
