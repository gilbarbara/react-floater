React Tooltips
===

[![NPM version](https://badge.fury.io/js/react-tooltips.svg)](https://www.npmjs.com/package/react-tooltips)
[![build status](https://travis-ci.org/gilbarbara/react-tooltips.svg)](https://travis-ci.org/gilbarbara/react-tooltips)
[![Maintainability](https://api.codeclimate.com/v1/badges/930e69ac58dc225e5389/maintainability)](https://codeclimate.com/github/gilbarbara/react-tooltips/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/930e69ac58dc225e5389/test_coverage)](https://codeclimate.com/github/gilbarbara/react-tooltips/test_coverage)

View the [demo](https://84vn36m178.codesandbox.io/)

## Usage

First install it.

```bash
npm install --save react-tooltips
```

And import it into your component:

```jsx
import Tooltip from 'react-tooltips';

<Tooltip content="This is the tooltip content">
  <span>click me</span>
</Tooltip>

```

And voíla!

## Modes

self-contained: the `children` will trigger the events and use itself as the tooltip's target.

proxy: the `children` will trigger the events but the tooltip will use the `target` prop as its target.  

beacon: the same as the proxy but the `children` will be positioned relative to the `target`.

controlled:  when you set a boolean to the `open` prop it will enter the controlled mode and no events will be fired.  

## Props

**animate** `bool` ➡ `true`  
Animate changes on scroll.
 
**autoOpen** `bool` ➡ `false`  
Wheter it should start on mount.

**callback** `func`  


**children** `node`  


**content** `node`  
The tooltip content. It can be anything that can be rendered.


**event** `string` -> `click`  
`hover | click`  

**eventDelay** `number` -> `0.4`  
The amount of time (in seconds) that hover tooltips should wait before hiding. Only valid for event type `hover`

**footer** `node`  

**id** `string|number`  

**offset** `number`-> `15`
  
**open** `bool` -> `false`  
The master switch

**placement** `string` -> `bottom`
The placement of the tooltip.
It will flip position if there's no space available.

It can be:  
'top', 'top-start', 'top-end'  
'bottom', 'bottom-start', 'bottom-end'  
'left', 'left-start', 'left-end'  
'right', 'right-start', 'right-end'  
'auto', 'center'  

**showCloseButton** `bool` -> `false`  
Except for target?

**styles** `object` -> `defaultStyles`  

**target** `object|string`  

**title** `node`  

**wrapperOptions** `object`  
positioning** `bool`  
offset** `number`  



## Styling



....

You can have controlled tooltips using the `open` prop, that can respond to an external change, in your Redux store or API response, for example.

```jsx
<Tooltip
  content="Some text..."
  open={some_boolean_flag}
  target=".App-title a"
/>
```
