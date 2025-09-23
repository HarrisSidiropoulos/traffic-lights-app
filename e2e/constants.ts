import { expect, type Page } from "@playwright/test";

export const baseUrl = "http://localhost:5173";

export const SELECTORS = {
  TRAFFIC_GREEN: "traffic-green",
  TRAFFIC_YELLOW: "traffic-yellow",
  TRAFFIC_RED: "traffic-red",
  PEDESTRIAN_DONT_WALK: "pedestrian-dontWalk",
  PEDESTRIAN_WALK: "pedestrian-walk",
  PEDESTRIAN_BTN: "pedestrian-btn",
} as const;

export const CLASSES = {
  LIGHT_GREEN: "light green",
  LIGHT_YELLOW: "light yellow",
  LIGHT_RED: "light red",
  LIGHT_INACTIVE: "light inactive",
  LIGHT_DONT_WALK: "light dontWalk",
  LIGHT_WALK: "light walk",
} as const;

export const verifyTrafficLightState = {
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

export const performAction = {
  PEDESTRIAN_REQUEST: async (page: Page) => {
    await page.click(`[data-testid="${SELECTORS.PEDESTRIAN_BTN}"]`);
  },
};
