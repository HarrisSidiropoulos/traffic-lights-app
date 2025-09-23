import { test } from "@playwright/test";
import { trafficLightMachine } from "../src/machines";
import { baseUrl } from "./constants";
import { verifyState } from "./utils";

test.describe("Traffic Light State Transitions", () => {
  for (const state of Object.keys(trafficLightMachine.states)) {
    test(`State verification: ${state}`, async ({ page }) => {
      await page.goto(baseUrl);
      await verifyState(state, page);
    });
  }
});
