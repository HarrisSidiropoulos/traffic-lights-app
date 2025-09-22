import { test, expect, Page } from "@playwright/test";
import { trafficLightMachine } from "../src/machines";
import { getSimplePaths } from "@xstate/graph";

const baseUrl = "http://localhost:5173";

const SELECTORS = {
  TRAFFIC_GREEN: "traffic-green",
  TRAFFIC_YELLOW: "traffic-yellow",
  TRAFFIC_RED: "traffic-red",
  PEDESTRIAN_DONT_WALK: "pedestrian-dontWalk",
  PEDESTRIAN_WALK: "pedestrian-walk",
  PEDESTRIAN_BTN: "pedestrian-btn",
} as const;

const EXPECTED_CLASSES = {
  LIGHT_GREEN: "light green",
  LIGHT_YELLOW: "light yellow",
  LIGHT_RED: "light red",
  LIGHT_INACTIVE: "light inactive",
  LIGHT_DONT_WALK: "light dontWalk",
  LIGHT_WALK: "light walk",
} as const;

const verifyTrafficLightState = {
  green: async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_GREEN
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_DONT_WALK)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_DONT_WALK
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_WALK)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
  },
  yellow: async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_YELLOW,
      { timeout: 10000 }
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_DONT_WALK)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_DONT_WALK
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_WALK)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
  },
  red: async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_RED,
      { timeout: 15000 }
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_DONT_WALK)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_INACTIVE
    );
    await expect(page.getByTestId(SELECTORS.PEDESTRIAN_WALK)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_WALK
    );
  },
};

const performAction = {
  PEDESTRIAN_REQUEST: async (page: Page) => {
    await page.click(`[data-testid="${SELECTORS.PEDESTRIAN_BTN}"]`);
  },
};

const waitForTimerTransition = {
  "green->yellow": async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_YELLOW)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_YELLOW,
      { timeout: 6000 }
    );
  },
  "yellow->red": async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_RED,
      {
        timeout: 3000,
      }
    );
  },
  "red->green": async (page: Page) => {
    await expect(page.getByTestId(SELECTORS.TRAFFIC_GREEN)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_GREEN,
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
      EXPECTED_CLASSES.LIGHT_GREEN,
      {
        timeout: 5000,
      }
    );
  });

  const naturalPaths = getSimplePaths(trafficLightMachine);

  naturalPaths.forEach((path, index) => {
    test(`should test natural timer-based path ${index + 1}`, async ({
      page,
    }) => {
      for (const [stepIndex, step] of path.steps.entries()) {
        const currentState = String(step.state.value);

        if (stepIndex > 0) {
          const prevStep = path.steps[stepIndex - 1];
          const prevState = String(prevStep.state.value);
          const transitionKey =
            `${prevState}->${currentState}` as keyof typeof waitForTimerTransition;

          if (waitForTimerTransition[transitionKey]) {
            await waitForTimerTransition[transitionKey](page);
          }
        }

        await verifyTrafficLightState[
          currentState as keyof typeof verifyTrafficLightState
        ]?.(page);
      }
    });
  });

  const pedestrianPaths = getSimplePaths(trafficLightMachine, {
    events: [{ type: "PEDESTRIAN_REQUEST" }],
  });

  pedestrianPaths.forEach((path, index) => {
    test(`should test pedestrian request scenario ${index + 1}`, async ({
      page,
    }) => {
      for (const [stepIndex, step] of path.steps.entries()) {
        const currentState = String(step.state.value);

        if (step.event) {
          const actionFunction =
            performAction[step.event.type as keyof typeof performAction];
          if (actionFunction) {
            await actionFunction(page);
          }
        }

        if (stepIndex > 0 && !step.event) {
          const prevStep = path.steps[stepIndex - 1];
          const prevState = String(prevStep.state.value);
          const transitionKey =
            `${prevState}->${currentState}` as keyof typeof waitForTimerTransition;

          if (waitForTimerTransition[transitionKey]) {
            await waitForTimerTransition[transitionKey](page);
          }
        }

        await verifyTrafficLightState[
          currentState as keyof typeof verifyTrafficLightState
        ]?.(page);
      }
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
      EXPECTED_CLASSES.LIGHT_YELLOW,
      { timeout: 1000 }
    );

    await page.click(pedestrianBtnSelector);

    await expect(page.getByTestId(SELECTORS.TRAFFIC_RED)).toHaveClass(
      EXPECTED_CLASSES.LIGHT_RED,
      {
        timeout: 3000,
      }
    );
  });
});
