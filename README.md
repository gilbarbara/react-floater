React Tooltips
===

[![NPM version](https://badge.fury.io/js/react-tooltips.svg)](https://www.npmjs.com/package/react-tooltips) 
[![build status](https://travis-ci.org/gilbarbara/react-tooltips.svg)](https://travis-ci.org/gilbarbara/react-tooltips) 
[![dependencies Status](https://david-dm.org/gilbarbara/react-tooltips/status.svg)](https://david-dm.org/gilbarbara/react-tooltips) 
[![Maintainability](https://api.codeclimate.com/v1/badges/930e69ac58dc225e5389/maintainability)](https://codeclimate.com/github/gilbarbara/react-tooltips/maintainability) 
[![Test Coverage](https://api.codeclimate.com/v1/badges/930e69ac58dc225e5389/test_coverage)](https://codeclimate.com/github/gilbarbara/react-tooltips/test_coverage)

View the [demo](https://84vn36m178.codesandbox.io/)

## Usage

Install.

```bash
npm install --save react-tooltips
```

Import it into your component:

```jsx
import Tooltip from 'react-tooltips';

<Tooltip content="This is the tooltip content">
    <span>click me</span>
</Tooltip>

```

And voíla!


## Styling
You can customize everything with the `styles` prop.  
Only set the properties you want to change and the defaultStyles will be merged.

Check it [styles.js](./src/styles.js) for the syntax.

## Props

**animate** `bool` ▶︎ `true`  
Animate the tooltip on scroll/resize.
 
**autoOpen** `bool` ▶︎ `false`  
Open the tooltip automatically.  

**callback** `func`  
It will be called when the tooltip change state with 2 parameters:  

- **action** `string`: `open` or `close`  
- **props** `object` the props you passed.

**children** `node`  
An element to trigger the tooltip. 

**classNames** `object`: `defaultClassNames`  
Object of class names for custom styles. Example from sass.
```js
classNames: {
  wrapper: '__tooltip',
  container: '__tooltip__container',
  content: '__tooltip__content',
  title: '__tooltip__title',
  footer: '__tooltip__footer',
  arrow: '__tooltip__arrow',
}
```

**content** `node`  
The tooltip content. It can be anything that can be rendered.  
It's the only required prop.

**event** `string` ▶︎ `click`  
The event that will trigger the tooltip. It can be `hover | click`.  
*These won't work in controlled mode.*

**eventDelay** `number` ▶︎ `0.4`  
The amount of time (in seconds) that hover tooltips should wait after a `mouseLeave` event before hiding.  
Only valid for event type `hover`.

**flip** `bool` ▶︎ `true`
Change the tooltip position on scroll/resize.

**footer** `node`  
It can be anything that can be rendered.  

**id** `string|number`  
In case that you need to identify the portal.

**offset** `number` ▶︎ `15`  
The distance between the tooltip and its target in pixels.

**open** `bool` ▶︎ `false`  
The switch between normal and controlled modes.  
*Setting this prop will disabled the normal behavior.*

**placement** `string` ▶︎ `bottom`  
The placement of the tooltip. It will flip position if there's no space available.
It can be:  
top (top-start, top-end),  
bottom (bottom-start, bottom-end)  
left (left-start, left-end),  
right (right-start, right-end,    
auto,  
center

**showCloseButton** `bool` ▶︎ `false`  
It will show a ⨉ button to close the tooltip.  
This will be `true` when you change `wrapperOptions` position.

**styles** `object` ▶︎ `defaultStyles`  
You can customize the UI using this prop.

**target** `object|string`  
The target used to calculate the tooltip position. If it's not set, it will use the `children` as the target.

**title** `node`  
It can be anything that can be rendered.  

**wrapperOptions** `object`  
Position the wrapper relative to the target.  
*You need to set a `target` for this to work.*

```js
{
    offset: number, // The distance between the wrapper and the target. It can be negative.
    placement: string, // the same options as above, except center
    position: bool, // Set to true to position the wrapper
}
```

## Modes

**Default**  
The wrapper will trigger the events and use itself as the tooltip's target.

```jsx
<Tooltip content="This is the tooltip content">
    <span>click me</span>
</Tooltip>

```

**Proxy**  
The wrapper will trigger the events but the tooltip will use the `target` to position itself.  

```jsx
<div className="App">
    <img src="some-path" />
        
    <Tooltip
      content="This is the tooltip content"
      target=".App img"
    >
        <span>click me</span> 
    </Tooltip>
</div>

```

**Beacon**  
The same as the proxy but the wrapper will be positioned relative to the `target`.

```jsx
<div className="App">
    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png" width="100" className="my-super-image" />
        
    <Tooltip
        content="This is the tooltip content"
        target=".my-super-image"
        wrapperOptions={{
            offset: -22,
            placement: 'top',
            position: true,
        }}
    >
    <span style={{ color: '#f04', fontSize: 34 }}>◉</span>
    </Tooltip>
</div>

```

**Controlled**  
When you set a boolean to the `open` prop it will enter the controlled mode and it will not respond to events.
In this mode you don't even need to have `children`

```jsx
<div className="App">
    <img src="some-path" />
    <Tooltip
        content="This is the tooltip content"
        open={true}
        target=".App img"
    />
</div>
```
