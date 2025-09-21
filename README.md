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

---

## Presentation

This project includes a presentation in `presentation.md`.

The presentation is written in Markdown and can be viewed or exported using [Marp](https://marp.app/) (see the [Marp documentation](https://marp.app/docs/) for details).

**Key files:**

- `src/machines.ts` — XState machine
- `src/App.tsx` — Main UI
