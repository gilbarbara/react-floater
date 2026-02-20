# React Floater Architecture

Internal reference for the react-floater library. Covers state management, rendering lifecycle, Popper.js integration, event handling, and all component interactions.

## File Structure

```
src/
  index.tsx                    # JSX shell (FloaterComponent + SSR gate)
  literals.ts                  # STATUS enum, POSITIONING_PROPS
  types/
    index.ts                   # Barrel export
    common.ts                  # Domain types (Props, State, Styles, etc.)
    popper.ts                  # Popper.js type wrappers
    utilities.ts               # Generic TS utilities
  components/
    Portal.tsx                 # DOM portal management (shared singleton)
    Wrapper.tsx                # Target element wrapper (event handlers, ref management)
    Floater/
      index.tsx                # Floating container (shouldRender, style computation)
      Arrow.tsx                # Directional arrow (SVG or custom)
      Container.tsx            # Default content layout (title, content, footer, close button)
      CloseButton.tsx          # X button SVG
  modules/
    helpers.ts                 # Pure utilities (DOM, logging, Popper helpers)
    hooks.ts                   # useMount, useUnmount, useUpdateEffect
    styles.ts                  # Default styles + deep merge
    useFloater.ts              # State machine, Popper management, event handlers
```

## State Machine

State is managed via `useReducer` in the `useFloater` hook (`src/modules/useFloater.ts`). The `State` shape:

```ts
{
  currentPlacement: Placement  // Popper-resolved placement (may differ from prop)
  positionWrapper: boolean     // Whether wrapper uses its own Popper instance
  status: Statuses             // Floater lifecycle status
  statusWrapper: Statuses      // Wrapper positioning status (for positionWrapper mode)
}
```

### Status Lifecycle

```
INIT ──> IDLE ──> RENDER ──> OPENING ──> OPEN ──> CLOSING ──> IDLE
                    ^                                           |
                    └───────────────────────────────────────────┘
```

`ERROR` is defined but never transitioned to.

### All Status Transitions

#### INIT to IDLE
- `initPopper()` called on mount with `status=INIT`
- `nextStatus` resolves to `IDLE` (since `status !== RENDER`)
- For non-center placements: `onFirstUpdate` sets `status: IDLE`
- For center placement: `requestAnimationFrame` sets `status: IDLE`
- If `floaterRef` is null and status is not `RENDER`: synchronous fallback sets `IDLE`

#### IDLE to RENDER
Triggered by `toggle(STATUS.RENDER)` from:
- `handleClick` when `status === 'idle'`
- `handleMouseEnter` when `status === IDLE`
- Status transitions effect: `previousStatus !== IDLE && status === IDLE && open` (controlled mode re-open)
- Status transitions effect: `previousStatus === INIT && status === IDLE && autoOpen`
- Controlled mode effect: `open` becomes `true` → `toggle(STATUS.RENDER)`

#### RENDER to OPENING
- Non-center: `initPopper()` creates Popper instance, `onFirstUpdate` callback sets `status: OPENING`
- Center: `requestAnimationFrame` sets `status: OPENING`

#### OPENING to OPEN
- `handleTransitionEnd`: CSS `transitionend` fires on the floater element after opacity transition completes

#### OPEN to CLOSING
Triggered by `toggle()` (resolves to `CLOSING` when current status is `OPEN`) from:
- `handleClick`
- `handleMouseLeave` (immediate or delayed via `eventDelay`)
- Controlled mode effect: `open` becomes `false` → `toggle(STATUS.CLOSING)`

#### CLOSING to IDLE
- `handleTransitionEnd`: CSS `transitionend` fires after closing opacity transition
- Then: Popper instance destroyed, `callback` prop fired with `action: 'close'`

### `toggle(forceStatus?)` Logic

```
nextStatus = (currentStatus === OPEN) ? CLOSING : RENDER
if forceStatus provided: nextStatus = forceStatus

updateState({
  status: nextStatus,
  statusWrapper: nextStatus === CLOSING ? RENDER : IDLE
})
```

### `updateState(nextState, callback?)`

Guards with `isMounted.current`. Updates both React state (`setState`) and `stateRef.current` (for synchronous reads in async callbacks and event handlers).

## Popper.js Integration

Two independent Popper instances can exist:

### Main Floater Popper (`popperRef`)

**Created** inside `initPopper()` when `floaterRef.current` is available:

```ts
createPopper(targetElement, floaterRef.current, {
  placement,
  strategy: isFixed(target) ? 'fixed' : 'absolute',
  modifiers: [ arrow, flip, offset, updatePlacement, applyArrowStyle, ...userModifiers ],
  onFirstUpdate: (popperState) => {
    updateState({ currentPlacement: popperState.placement, status: nextStatus });
  }
})
```

**Modifiers:**
1. `arrow` - enabled when `!hideArrow`, padding: 8
2. `flip` - enabled when `!disableFlip`, uses `getFallbackPlacements()`
3. `offset` - `[0, offset]` (default 15px)
4. `updatePlacement` - custom `afterWrite`: syncs `currentPlacement` state when Popper adjusts placement
5. `applyArrowStyle` - custom `write`: sets directional inline styles on arrow element
6. User modifiers spread last (from `getModifiers(modifiers)`)

**Destroyed:**
- Before creating a new one: status transitions effect when `status` becomes `RENDER`
- On close: status transitions effect when `status` becomes `IDLE` from `CLOSING`
- On unmount: `cleanUp()`

**Force-updated:**
- `window.load` event
- After `handleTransitionEnd`
- When `onFirstUpdate` detects placement changed

### Center Placement (No Popper)

When `placement === 'center'`, no Popper instance is created. The floater uses CSS fixed positioning (`floaterCentered` styles: `position:fixed, left:50%, top:50%, transform:translate(-50%,-50%)`). Status advancement happens via `requestAnimationFrame()`.

### Wrapper Popper (`wrapperPopper`)

Only created when `positionWrapper` is true. Positions the wrapper/beacon relative to the target element. Simplified config: no arrow, no flip, offset only.

### `getPopper` Callback

Called synchronously after each `createPopper`:
```ts
getPopper(popperRef.current, 'floater')
getPopper(wrapperPopper.current, 'wrapper')
```

Stored in `getPopperRef` (a ref updated every render) to avoid stale closures in `initPopper`.

### `popperGeneration` Guard

An incrementing counter (`popperGeneration.current++`) at the start of each `initPopper()` call. The captured `generation` value is checked inside async callbacks (`onFirstUpdate`, center `setTimeout`) before applying state updates. Prevents stale callbacks from earlier `initPopper` invocations from overwriting current status.

## Rendering

### Component Tree

```
ReactFloater (SSR gate)
  └─ FloaterComponent (thin JSX shell)
       ├─ useFloater(props) → refs, state, computed values, handlers
       ├─ Portal (createPortal to shared DOM node)
       │    ├─ Floater (floating UI)
       │    │    ├─ Container | component() | cloneElement(component)
       │    │    └─ Arrow
       │    └─ Wrapper (only when positionWrapper)
       └─ Wrapper (only when !positionWrapper)
```

### Portal

Manages a shared `div#react-floater-portal` appended to `document.body`. Multiple floater instances share the same portal node, tracked via `data-ids`. The last instance to unmount removes the DOM node.

First render returns `null` (portal node created in `useMount`). Children render via `createPortal` from the second render onward.

Returns `null` when `!hasChildren && !target && placement !== 'center'`.

### Floater (`shouldRender`)

```ts
const shouldRender = ['closing', 'open', 'opening', 'render'].includes(status);
```

- `INIT` / `IDLE`: returns `null` (floater not in DOM)
- `RENDER`: rendered but invisible (opacity:0, visibility:hidden) so Popper can measure
- `OPENING`: opacity transitions to 1, visibility:visible
- `OPEN`: fully visible, adds `__floater__open` class
- `CLOSING`: opacity transitions to 0, visibility still visible (for transition)

The `floaterRef` is only set when `shouldRender` is true.

### Floater Styles (useMemo)

Layered composition:
1. Base `floater` style (opacity:0, visibility:hidden, drop-shadow, transition:opacity 0.3s)
2. Arrow padding (directional based on placement)
3. Status overlay (`floaterClosing` or `floaterOpening`)
4. Center overlay (`floaterCentered`) when placement is center
5. Component overlay (`floaterWithComponent`: maxWidth:100%) when using component prop

### Floater `component` Prop

Two rendering modes:
- `isValidElement(component)`: `cloneElement(component, { closeFn, id, role: 'tooltip' })`
- Function: `component({ closeFn, id, role: 'tooltip' })` called as a function (not JSX)

`closeFn` is `handleClick` from the parent, allowing the custom component to close the floater.

### Wrapper

Wraps the children (target element). Child handling:

| Children shape | Rendering |
|---|---|
| Single native DOM element | `cloneElement(child, { id, ref, ...wrapperProps })` |
| Single function component | `<span ref={wrapperRef}>` wrapping `cloneElement(child, { innerRef: childRef })` |
| Fragment or multiple | `<span ref={wrapperRef}>` wrapping all children |

Sets `aria-describedby={id}` when status is OPENING, OPEN, or CLOSING.

Style merge order: `wrapper defaults < style prop < child's own style` (child wins).

## Event Handling

### Controlled vs Uncontrolled

**Detection:** `is.boolean(open)` (true = controlled, undefined = uncontrolled)

| | Controlled | Uncontrolled |
|---|---|---|
| Wrapper events | None (no click/hover handlers) | onClick, onMouseEnter, onMouseLeave |
| Open/close driver | `open` prop changes via controlled mode effect | User interaction via handlers |
| Close button | Suppressed (parent manages open) | Shown when `showCloseButton` or `positionWrapper` |
| Status re-trigger | Status transitions effect: `status === IDLE && open` reopens | N/A |

### Click Event Flow

```
handleClick
  └─ is.boolean(open)? → return (controlled mode)
  └─ currentEvent === 'click' || (hover && positionWrapper)?
       └─ toggle(status === 'idle' ? STATUS.RENDER : undefined)
```

### Hover Event Flow

```
handleMouseEnter
  └─ Guards: controlled? mobile? not hover? → return
  └─ status === IDLE?
       └─ Clear pending close timer
       └─ toggle(STATUS.RENDER)

handleMouseLeave
  └─ Guards: controlled? mobile? → return
  └─ currentEvent === 'hover'?
       └─ No eventDelay:
            toggle(CLOSING or IDLE)
       └─ With eventDelay (default 0.4s) && !positionWrapper:
            setTimeout(eventDelay * 1000) → toggle()
```

### Mobile Detection

```ts
isMobile() = 'ontouchstart' in window && /Mobi/.test(navigator.userAgent)
```

When `event='hover'` on mobile and `!disableHoverToClick`: `currentEvent` is converted to `'click'`.

### CSS Transition Handling

The `transitionend` listener is attached via `once()` (self-removing) when status changes to `RENDER` or `CLOSING`:

```ts
if (
  floaterRef.current &&
  (status === STATUS.RENDER || status === STATUS.CLOSING) &&
  previousStatus.current !== status
) {
  once(floaterRef.current, 'transitionend', handleTransitionEnd);
}
```

`handleTransitionEnd` advances: OPENING to OPEN, or anything else to IDLE. Fires the `callback` prop with `action: 'open'` or `'close'`.

## `positionWrapper` Mode

Activated when `wrapperOptions.position === true && !!target`.

### What It Does

Positions the Wrapper (beacon) relative to the target using a second Popper instance, instead of the beacon sitting where it was rendered in the React tree.

### Rendering Change

The Wrapper renders inside the Portal (instead of in-place):
```jsx
<Portal>
  <Floater />
  {positionWrapper && wrapper}   {/* beacon in portal */}
</Portal>
{!positionWrapper && wrapper}    {/* OR beacon in-place */}
```

### Style Behavior

- `status !== IDLE`: wrapper gets `wrapperPosition` styles (off-screen: `left:-1000, top:-1000, visibility:hidden`)
- `statusWrapper === RENDER`: wrapper gets Popper-computed styles from `wrapperPopper.current.state.styles`

### Event Behavior

- Hover mode: beacon uses click (not hover) to open
- mouseLeave does not auto-close in positionWrapper mode
- Close button always shown in uncontrolled mode (no wrapper click to close)

## Effects Summary

| Effect | Deps | Purpose |
|---|---|---|
| Window load listener | `[handleLoad]` | Force-update poppers on page load |
| Mount initPopper | `[]` | Sets `isMounted`, calls initial `initPopper()` via ref |
| Debug logging | `[children, target, open, positionWrapper, currentDebug]` | Console group logging when debug enabled |
| Unmount cleanup | `[cleanUp, handleLoad]` | Cleanup: timers, poppers, event listeners |
| Controlled mode | `[open, toggle]` | Responds to `open` prop changes (skips first render) |
| Position wrapper sync | `[wrapperOptions?.position, target, updateState]` | Syncs `positionWrapper` state when props change |
| Status transitions | `[status]` | Main state machine driver (see below) |

## Focused Effects (State Machine Drivers)

Three effects replace the former monolithic `useUpdateEffect` + `tree-changes-hook` approach. A `previousStatus` ref tracks the prior status value for transition detection.

### Controlled mode effect (`useUpdateEffect([open, toggle])`)

Skips first render. When `open` changes, calls `toggle(STATUS.RENDER)` or `toggle(STATUS.CLOSING)`.

### Position wrapper sync (`useEffect([wrapperOptions?.position, target])`)

Updates `positionWrapper` state when `wrapperOptions.position` or `target` changes. Guarded to avoid no-op updates.

### Status transitions effect (`useEffect([status])`)

Fires when `status` changes. Uses `previousStatus.current` to detect specific transitions:

```
1. status === IDLE && previousStatus !== IDLE:
   - open → toggle(RENDER) — re-open controlled floater after close cycle
   - previousStatus === INIT && autoOpen → toggle(RENDER) — auto-open on mount

2. status === RENDER && previousStatus !== RENDER:
   → destroy old popper, call initPopper()

3. (status === RENDER || status === CLOSING) && previousStatus !== status:
   → attach one-time transitionend listener via once()

4. status === IDLE && previousStatus === CLOSING:
   → destroy popper, force-update wrapperPopper

5. previousStatus = status (update ref at end)
```

## Styles System

`getStyles(styles?)` deep-merges user overrides onto defaults via `deepmerge-ts`.

Key defaults:
- `floater`: `opacity:0, visibility:hidden, transition: opacity 0.3s`
- `floaterOpening`: `opacity:1, visibility:visible`
- `floaterClosing`: `opacity:0, visibility:visible`
- `floaterCentered`: `position:fixed, left:50%, top:50%, transform:translate(-50%,-50%)`
- `options.zIndex`: `100` (used by Portal, Floater, Wrapper)
- `arrow.size`: `16` (SVG dimensions)

`currentStyles` (useMemo in `useFloater`) extends the base styles with:
- Wrapper positioning overrides (for `positionWrapper` mode)
- Target element computed style inheritance (for non-static positioned targets)

## Types

### Public API Exports

```ts
export type { Action, CustomComponentProps, Placement, PopperInstance, Props, Styles }
```

### Props Constraint

```ts
type Props = RequireExactlyOne<BaseProps, 'content' | 'component'>
```

Enforces exactly one of `content` or `component` at the type level.

### `PopperModifiers`

Typed named-modifier object (not array). `getModifiers()` deep-merges with defaults (flip padding:20, preventOverflow padding:10). `initPopper` destructures `{ arrow, flip, offset, ...rest }` and spreads rest into the Popper config.

## Key Patterns

### `stateRef` for Synchronous Reads

State is stored in both React state (triggers renders) and `stateRef.current` (immediate reads). `updateState` updates both. This avoids stale closures in event handlers and async Popper callbacks.

### `popperGeneration` for Stale Callback Protection

Each `initPopper()` call increments a generation counter. Async callbacks (`onFirstUpdate`, center `setTimeout`) capture the generation at creation time and compare against `popperGeneration.current` before applying updates.

### `once()` for Self-Removing Listeners

`transitionend` listeners are attached via `once()`, which wraps `addEventListener` with a handler that calls `removeEventListener` after the first invocation.

### `isMounted` Guard

All `updateState` calls are gated by `isMounted.current`, preventing setState-after-unmount.

### SSR Gate

The default export checks `canUseDOM()` and returns `null` when there is no DOM (server-side rendering).
