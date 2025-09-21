import { test, expect, Page } from "@playwright/test";
import { trafficLightMachine } from "../src/machines";

const baseUrl = "http://localhost:5173";

const trafficStateMapping: Record<string, (page: Page) => Promise<void>> = {
  green: async (page: Page) => {
    await expect(page.getByTestId("traffic-green")).toHaveClass("light green");
    await expect(page.getByTestId("traffic-yellow")).toHaveClass(
      "light inactive"
    );
    await expect(page.getByTestId("traffic-red")).toHaveClass("light inactive");
    await expect(page.getByTestId("pedestrian-dontWalk")).toHaveClass(
      "light dontWalk"
    );
    await expect(page.getByTestId("pedestrian-walk")).toHaveClass(
      "light inactive"
    );
  },
  yellow: async (page: Page) => {
    // wait for 5 seconds to allow the transition to yellow
    await expect(page.getByTestId("traffic-yellow")).toHaveClass(
      "light yellow",
      { timeout: 7000 }
    );
    await expect(page.getByTestId("traffic-green")).toHaveClass(
      "light inactive"
    );
    await expect(page.getByTestId("traffic-red")).toHaveClass("light inactive");
    await expect(page.getByTestId("pedestrian-dontWalk")).toHaveClass(
      "light dontWalk"
    );
    await expect(page.getByTestId("pedestrian-walk")).toHaveClass(
      "light inactive"
    );
  },
  red: async (page: Page) => {
    await expect(page.getByTestId("traffic-red")).toHaveClass("light red", {
      timeout: 15000,
    });
    await expect(page.getByTestId("traffic-green")).toHaveClass(
      "light inactive"
    );
    await expect(page.getByTestId("traffic-yellow")).toHaveClass(
      "light inactive"
    );
    await expect(page.getByTestId("pedestrian-dontWalk")).toHaveClass(
      "light inactive"
    );
    await expect(page.getByTestId("pedestrian-walk")).toHaveClass("light walk");
  },
};

test.describe("Traffic light transitions", () => {
  for (const state of Object.keys(trafficLightMachine.states)) {
    test(`should transition to: ${state}`, async ({ page }) => {
      await page.goto(baseUrl);
      await trafficStateMapping[state](page);
    });
  }
});
