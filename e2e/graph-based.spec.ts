import { test, expect, Page } from "@playwright/test";
import { trafficLightMachine } from "../src/machines";
import { getShortestPaths, getSimplePaths } from "@xstate/graph";

const baseUrl = "http://localhost:5173";

const SELECTORS = {
  TRAFFIC_GREEN: "traffic-green",
  TRAFFIC_YELLOW: "traffic-yellow",
  TRAFFIC_RED: "traffic-red",
  PEDESTRIAN_DONT_WALK: "pedestrian-dontWalk",
  PEDESTRIAN_WALK: "pedestrian-walk",
  PEDESTRIAN_BTN: "pedestrian-btn",
} as const;

const CLASSES = {
  LIGHT_GREEN: "light green",
  LIGHT_YELLOW: "light yellow",
  LIGHT_RED: "light red",
  LIGHT_INACTIVE: "light inactive",
  LIGHT_DONT_WALK: "light dontWalk",
  LIGHT_WALK: "light walk",
} as const;

// Valid traffic light states for verification
type TrafficState = "green" | "yellow" | "red";

// Valid transition keys for waiting
type TransitionKey = "green->yellow" | "yellow->red" | "red->green";

const verifyTrafficLightState = {
  green: async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      CLASSES.LIGHT_GREEN
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_DONT_WALK)).toHaveClass(
      CLASSES.LIGHT_DONT_WALK
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_WALK)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
  },
  yellow: async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      CLASSES.LIGHT_YELLOW,
      { timeout: 10000 }
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_DONT_WALK)).toHaveClass(
      CLASSES.LIGHT_DONT_WALK
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_WALK)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
  },
  red: async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      CLASSES.LIGHT_RED,
      { timeout: 15000 }
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_DONT_WALK)).toHaveClass(
      CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_WALK)).toHaveClass(
      CLASSES.LIGHT_WALK
    );
  },
};

const performAction = {
  PEDESTRIAN_REQUEST: async (page: Page) => {
    await page.click(`[data-testid="${SELECTORS.PEDESTRIAN_BTN}"]`);
  },
};

// Helper functions to avoid repetitive type casting
const verifyState = (state: string, page: Page) => {
  const stateVerifier = verifyTrafficLightState[state as TrafficState];
  return stateVerifier?.(page);
};

const waitForTransition = (fromState: string, toState: string, page: Page) => {
  const transitionWaiter =
    waitForTimerTransition[`${fromState}->${toState}` as TransitionKey];
  return transitionWaiter?.(page);
};

const performEventAction = (eventType: string, page: Page) => {
  const actionFunction = performAction[eventType as keyof typeof performAction];
  return actionFunction?.(page);
};

const waitForTimerTransition = {
  "green->yellow": async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      CLASSES.LIGHT_YELLOW,
      { timeout: 6000 }
    );
  },
  "yellow->red": async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      CLASSES.LIGHT_RED,
      {
        timeout: 3000,
      }
    );
  },
  "red->green": async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      CLASSES.LIGHT_GREEN,
      {
        timeout: 7000,
      }
    );
  },
};

test.describe("XState Graph-Based E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      CLASSES.LIGHT_GREEN,
      {
        timeout: 5000,
      }
    );
  });

  const naturalPaths = getShortestPaths(trafficLightMachine);

  naturalPaths.forEach((path, index) => {
    test.describe(`Natural Timer Sequence ${index + 1}`, () => {
      path.steps.forEach((step, stepIndex) => {
        const currentState = String(step.state.value);

        if (stepIndex === 0) {
          test(`Initial state: ${currentState}`, async ({ page }) => {
            await verifyState(currentState, page);
          });
        } else {
          const prevStep = path.steps[stepIndex - 1];
          const prevState = String(prevStep.state.value);

          test(`Timer transition: ${prevState} → ${currentState}`, async ({
            page,
          }) => {
            for (let i = 0; i < stepIndex; i++) {
              const currentStepState = String(path.steps[i].state.value);

              if (i > 0) {
                const prevStepState = String(path.steps[i - 1].state.value);

                await waitForTransition(prevStepState, currentStepState, page);
              }

              await verifyState(currentStepState, page);
            }

            await waitForTransition(prevState, currentState, page);
            await verifyState(currentState, page);
          });
        }
      });
    });
  });

  const pedestrianPaths = getSimplePaths(trafficLightMachine, {
    events: [{ type: "PEDESTRIAN_REQUEST" }],
  });

  pedestrianPaths.forEach((path, index) => {
    test.describe(`Pedestrian Request Scenario ${index + 1}`, () => {
      path.steps.forEach((step, stepIndex) => {
        const currentState = String(step.state.value);

        // Handle initial state
        if (stepIndex === 0) {
          test(`Initial state: ${currentState}`, async ({ page }) => {
            await verifyState(currentState, page);
          });
          return;
        }

        // Setup common variables for non-initial steps
        const prevStep = path.steps[stepIndex - 1];
        const prevState = String(prevStep.state.value);
        const hasEvent = !!step.event;

        // Create test based on step type
        const testName = hasEvent
          ? `Event handling: ${step.event?.type} in ${prevState} state`
          : `State transition: ${prevState} → ${currentState}`;

        test(testName, async ({ page }) => {
          // Replay all previous steps to reach current position
          for (let i = 0; i < stepIndex; i++) {
            const currentStepState = String(path.steps[i].state.value);
            const currentStep = path.steps[i];

            if (currentStep.event) {
              await performEventAction(currentStep.event.type, page);
            }

            if (i > 0 && !currentStep.event) {
              const prevStepState = String(path.steps[i - 1].state.value);
              await waitForTransition(prevStepState, currentStepState, page);
            }

            await verifyState(currentStepState, page);
          }

          // Execute the current step action
          if (hasEvent && step.event) {
            await performEventAction(step.event.type, page);
          }

          // Handle state transition if no event
          if (!hasEvent) {
            await waitForTransition(prevState, currentState, page);
          }

          // Verify final state
          await verifyState(currentState, page);
        });
      });
    });
  });

  test("should handle edge cases discovered by graph traversal", async ({
    page,
  }) => {
    const pedestrianBtnSelector = `[data-testid="${SELECTORS.PEDESTRIAN_BTN}"]`;

    await page.click(pedestrianBtnSelector);
    await page.click(pedestrianBtnSelector);
    await page.click(pedestrianBtnSelector);

    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      CLASSES.LIGHT_YELLOW,
      { timeout: 1000 }
    );

    await page.click(pedestrianBtnSelector);

    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      CLASSES.LIGHT_RED,
      {
        timeout: 3000,
      }
    );
  });
});
