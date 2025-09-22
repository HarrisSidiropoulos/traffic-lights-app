# XState Traffic Light Demo

This is a simple web app that simulates a traffic light using an [XState](https://xstate.js.org/) state machine, built with React and TypeScript.

## Features

- Interactive traffic light (red, yellow, green)
- State managed by XState

## Usage

1. Install dependencies:
   ```sh
   pnpm install
   ```
2. Start the app:
   ```sh
   pnpm dev
   ```
3. Open [http://localhost:5173](http://localhost:5173)

## Testing

This project includes comprehensive end-to-end testing using Playwright, with a focus on **graph-based testing** leveraging XState's state machine capabilities.

### Graph-Based E2E Testing

The project uses XState's `@xstate/graph` library to automatically generate test paths based on the state machine definition. This approach provides several advantages:

- **Complete Coverage**: Automatically tests all possible state transitions and paths through the traffic light system
- **Model-Based Testing**: Tests are derived directly from the XState machine definition, ensuring consistency between implementation and testing
- **Natural Path Testing**: Tests both timer-based automatic transitions and user-triggered events (pedestrian button)
- **Edge Case Discovery**: Graph traversal helps identify and test edge cases that might be missed in manual test writing

#### Test Structure

The graph-based tests (`e2e/graph-based.spec.ts`) include:

1. **Natural Timer Paths**: Tests automatic state transitions (green → yellow → red → green)
2. **Pedestrian Request Scenarios**: Tests user interactions with the pedestrian crossing button
3. **Edge Case Handling**: Tests multiple rapid button presses and other boundary conditions

#### Running Tests

```sh
# Run all e2e tests
pnpm test:e2e

# Run tests in UI mode for debugging
pnpm test:e2e:ui

# Run unit tests
pnpm test
```

The tests verify:

- Correct visual state of traffic lights (active/inactive classes)
- Proper timing of state transitions
- Pedestrian light behavior synchronized with traffic lights
- Handling of user interactions during different states

---

## Presentation

This project includes a presentation in `presentation.md`.

The presentation is written in Markdown and can be viewed or exported using [Marp](https://marp.app/) (see the [Marp documentation](https://marp.app/docs/) for details).

**Key files:**

- `src/machines.ts` — XState machine
- `src/App.tsx` — Main UI
