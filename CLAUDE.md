# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run watch` - Build and watch for changes (uses tsup)
- `npm run build` - Clean and build the library for production

### Testing
- `npm test` - Run tests in watch mode (development)
- `npm run test:coverage` - Run tests with coverage report
- Run a single test: `vitest run test/index.spec.tsx`

### Quality Checks
- `npm run lint` - Lint and fix code issues
- `npm run typecheck` - Run TypeScript type checking
- `npm run validate` - Run full validation suite (lint, typecheck, test, build, size check)
- `npm run size` - Check bundle size limits

## Architecture

### Core Component Flow
The library uses a state machine pattern for managing the floater lifecycle:

1. **Main Entry** (`src/index.tsx`): The `ReactFloater` component manages state using `useReducer` and handles:
   - Popper.js instance creation/management for positioning
   - Event handling (click/hover) with mobile detection
   - Portal rendering for the floating element
   - Status transitions: IDLE → OPENING → OPEN → CLOSING → IDLE

2. **Component Structure**:
   - `Portal` (`src/components/Portal.tsx`): Manages DOM portal rendering
   - `Floater` (`src/components/Floater/index.tsx`): The floating UI container
   - `Container` (`src/components/Floater/Container.tsx`): Content wrapper with title/footer
   - `Arrow` (`src/components/Floater/Arrow.tsx`): Customizable arrow element
   - `Wrapper` (`src/components/Wrapper.tsx`): Target element wrapper for beacon mode

3. **Positioning System**: Uses Popper.js v2 with:
   - Custom modifiers configuration via `getModifiers()` helper
   - Fallback placements for auto-positioning
   - Fixed positioning detection for proper scrolling behavior

### Key Patterns

**State Management**: The component uses `useReducer` with status-based state transitions. Changes are tracked using `tree-changes-hook` for efficient callback triggers.

**Style Merging**: Custom styles are deeply merged with defaults using `deepmerge-ts`. The styles object structure is defined in `src/modules/styles.ts`.

**Event Handling**: Special handling for mobile devices (converts hover to click) and delayed hiding for hover events using timeouts.

**Type Safety**: Uses TypeScript with strict typing. Key type definitions in:
- `src/types/common.ts`: Component props, states, and common types
- `src/types/popper.ts`: Popper.js related types

### Testing Approach
- Uses Vitest with React Testing Library
- Test files in `test/` directory
- Coverage requirements: 90% for all metrics
- Mock components in `test/__fixtures__/`