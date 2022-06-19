# React Floater

[![NPM version](https://badge.fury.io/js/react-floater.svg)](https://www.npmjs.com/package/react-floater) [![CI](https://github.com/gilbarbara/react-floater/actions/workflows/main.yml/badge.svg)](https://github.com/gilbarbara/react-floater/actions/workflows/main.yml) [![Maintainability](https://api.codeclimate.com/v1/badges/a3457f536c0915c0935b/maintainability)](https://codeclimate.com/github/gilbarbara/react-floater/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/a3457f536c0915c0935b/test_coverage)](https://codeclimate.com/github/gilbarbara/react-floater/test_coverage)

Advanced tooltips for React!

View the [demo](https://codesandbox.io/s/github/gilbarbara/react-floater/tree/main/demo)

## Highlights

- 🏖 **Easy to use:** Just set the `content`
- 🛠 **Flexible:** Personalize the options to fit your needs
- 🟦 **Typescript:** Nicely typed

## Usage

```bash
npm install --save react-floater
```

Import it in your app:

```jsx
import Floater from 'react-floater';

<Floater content="This is the Floater content">
  <span>click me</span>
</Floater>;
```

And voíla!

## Customization

You can use your own components to render the Floater with the prop `component`.  
Check `WithStyledComponents.js` in the [demo](https://codesandbox.io/s/github/gilbarbara/react-floater/tree/main/demo) for an example.

If you use your own components as `children` it will receive an `innerRef` prop that you must set in your HTMLElement:

```typescript jsx
const Button = ({ innerRef, ...rest }) => <button ref={innerRef} {...rest} />;

<Floater content="This is the Floater content">
  <Button>click me</Button>
</Floater>;
```

This works with styled-components (and other css-in-js libraries):

```typescript jsx
const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 500px;
  line-height: 1.5;
`;

<Floater content="This is the Floater content">
  <Wrapper>click me</Wrapper>
</Floater>;
```

## Props

**autoOpen?: boolean = `false`**  
Open the Floater automatically.

**callback?: (action: 'open' | 'close', props: Props)**  
It will be called when the Floater change state.

**children: React.ReactNode**  
An element to trigger the Floater.

**component** {element|function}  
A React component or function to as a custom UI for the Floater.  
The prop `closeFloater` will be available in your component.

**content** {node}  
The Floater content. It can be anything that can be rendered.  
_This is the only required props, unless you pass a_ `component`.

**debug** {bool} ▶︎ `false`  
Log some basic actions.  
_You can also set a global variable_ `ReactFloaterDebug = true;`

**disableFlip** {bool} ▶︎ `false`  
Disable changes in the Floater position on scroll/resize.

**disableHoverToClick** {bool} ▶︎ `false`  
Don't convert _hover_ event to _click_ on mobile.

**event** {string} ▶︎ `click`  
The event that will trigger the Floater. It can be `hover | click`.  
_These won't work in controlled mode._

**eventDelay** {number} ▶︎ `0.4`  
The amount of time (in seconds) that the floater should wait after a `mouseLeave` event before hiding.  
Only valid for event type `hover`.

**footer** {node}  
It can be anything that can be rendered.

**getPopper** {function} Get the popper.js instance. It receives with 2 parameters:

- **popper** {object} the popper object
- **origin** {object} `floater` or `wrapper`

**hideArrow** {bool} ▶︎ `false`  
Don't show the arrow. Useful for centered or modal layout.

**offset** {number} ▶︎ `15`  
The distance between the Floater and its target in pixels.

**open** {bool}
The switch between normal and controlled modes.  
_Setting this prop will disabled the normal behavior._

**options** {object}  
Customize popper.js modifiers.  
_Don't use it unless you know what you're doing_

**placement** {string} ▶︎ `bottom`  
The placement of the Floater. It will update the position if there's no space available.

It can be:

- top (top-start, top-end)
- bottom (bottom-start, bottom-end)
- left (left-start, left-end)
- right (right-start, right-end)
- auto
- center

**portalElement** {string|null|HTMLElement}  
A css selector or element to render the tooltips

**showCloseButton** {bool} ▶︎ `false`  
It will show a ⨉ button to close the Floater.  
This will be `true` when you change `wrapperOptions` position.

**styles** {object} ▶︎ `defaultStyles`  
Customize the default UI.

**target** {object|string}  
The target used to calculate the Floater position. If it's not set, it will use the `children` as the target.

**title** {node}  
It can be anything that can be rendered.

**wrapperOptions** {WrapperOptions}  
Position the wrapper relative to the target.  
_You need to set a `target` for this to work._

```typescript
interface WrapperOptions {
  offset: number; // The distance between the wrapper and the target. It can be negative.
  placement: string; // the same options as above, except center
  position: bool; // Set to true to position the wrapper
}
```

## Styling

You can customize everything with the `styles` prop.  
Only set the properties you want to change and the default styles will be merged.

Check the [styles.ts](src/modules/styles.ts) for the syntax.

## Modes

**Default**  
The wrapper will trigger the events and use itself as the Floater's target.

```typescript jsx
<Floater content="This is the Floater content">
  <span>click me</span>
</Floater>
```

**Proxy**  
The wrapper will trigger the events but the Floater will use the **target** prop to position itself.

```typescript jsx
<div className="App">
  <img src="some-path" />

  <Floater content="This is the Floater content" target=".App img">
    <span>click me</span>
  </Floater>
</div>
```

**Beacon**  
The same as the **proxy mode** but the wrapper will be positioned relative to the `target`.

```typescript jsx
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
When you set a boolean to the `open` prop it will enter the controlled mode and it will not respond to events.  
In this mode you don't even need to have `children`

```typescript jsx
<div className="App">
  <img src="some-path" />
  <Floater content="This is the Floater content" open={true} target=".App img" />
</div>
```
