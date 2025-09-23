import { test, expect, Page } from "@playwright/test";
import { trafficLightMachine } from "../src/machines";
import { getShortestPaths, getSimplePaths } from "@xstate/graph";
import {
  SELECTORS,
  CLASSES,
  baseUrl,
  verifyTrafficLightState,
} from "./constants";

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
} as const;

type TransitionKey = keyof typeof waitForTimerTransition;
type TrafficState = keyof typeof verifyTrafficLightState;

const performAction = {
  PEDESTRIAN_REQUEST: async (page: Page) => {
    await page.click(`[data-testid="${SELECTORS.PEDESTRIAN_BTN}"]`);
  },
};

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

        const prevStep = path.steps[stepIndex - 1];
        const prevState =
          prevStep && prevStep.state ? String(prevStep.state.value) : "Initial";

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

        const prevStep = path.steps[stepIndex - 1];
        const prevState =
          prevStep && prevStep.state ? String(prevStep.state.value) : "Initial";
        const hasEvent = !!step.event;

        const testName = hasEvent
          ? `Event handling: ${step.event?.type} in ${prevState} state`
          : `State transition: ${prevState} → ${currentState}`;

        test(testName, async ({ page }) => {
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

          if (hasEvent && step.event) {
            await performEventAction(step.event.type, page);
          }

          if (!hasEvent) {
            await waitForTransition(prevState, currentState, page);
          }

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
