import { test, expect, Page } from "@playwright/test";
import { trafficLightMachine } from "../src/machines";

const baseUrl = "http://localhost:5173";

const SELECTORS = {
  TRAFFIC_GREEN: "traffic-green",
  TRAFFIC_YELLOW: "traffic-yellow",
  TRAFFIC_RED: "traffic-red",
  PEDESTRIAN_DONT_WALK: "pedestrian-dontWalk",
  PEDESTRIAN_WALK: "pedestrian-walk",
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
      { timeout: 7000 }
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
      {
        timeout: 15000,
      }
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

// Helper function to avoid repetitive type casting
const verifyState = (state: string, page: Page) => {
  const stateVerifier = verifyTrafficLightState[state as TrafficState];
  return stateVerifier?.(page);
};

test.describe("Traffic Light State Transitions", () => {
  for (const state of Object.keys(trafficLightMachine.states)) {
    test(`State verification: ${state}`, async ({ page }) => {
      await page.goto(baseUrl);
      await verifyState(state, page);
    });
  }
});
