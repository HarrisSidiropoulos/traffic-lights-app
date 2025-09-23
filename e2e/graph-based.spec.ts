import { test, expect } from "@playwright/test";
import { trafficLightMachine } from "../src/machines";
import { getShortestPaths } from "@xstate/graph";
import { SELECTORS, CLASSES, baseUrl } from "./constants";
import { performEventAction, verifyState } from "./utils";

test.describe("XState Graph-Based E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  const shortestTrafficLightPaths = getShortestPaths(trafficLightMachine);

  shortestTrafficLightPaths.forEach((path, index) => {
    test.describe(`Natural Timer Sequence ${index + 1}`, () => {
      path.steps.forEach((step, stepIndex) => {
        const currentState = `${step.state.value}`;

        const prevStep = path.steps[stepIndex - 1];
        const prevState = prevStep?.state
          ? `${prevStep.state.value}`
          : "Initial";

        test(`Timer transition: ${prevState} → ${currentState}`, async ({
          page,
        }) => {
          for (let i = 0; i <= stepIndex; i++) {
            const currentStepState = `${path.steps[i].state.value}`;

            await verifyState(currentStepState, page);
          }
        });
      });
    });
  });

  const pedestrianPaths = getShortestPaths(trafficLightMachine, {
    events: [{ type: "PEDESTRIAN_REQUEST" }],
  });

  pedestrianPaths.forEach((path, index) => {
    test.describe(`Pedestrian Request Scenario ${index + 1}`, () => {
      path.steps.forEach((step, stepIndex) => {
        const currentState = `${step.state.value}`;

        const prevStep = path.steps[stepIndex - 1];
        const prevState = prevStep?.state
          ? `${prevStep.state.value}`
          : "Initial";
        const hasEvent = !!step.event;

        const testName = hasEvent
          ? `Event handling: ${step.event?.type} in ${prevState} state`
          : `State transition: ${prevState} → ${currentState}`;

        test(testName, async ({ page }) => {
          for (let i = 0; i <= stepIndex; i++) {
            const currentStepState = `${path.steps[i].state.value}`;
            const currentStep = path.steps[i];

            if (currentStep.event) {
              await performEventAction(currentStep.event.type, page);
            }

            await verifyState(currentStepState, page);
          }
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
