import { test, Page } from "@playwright/test";
import { trafficLightMachine } from "../src/machines";
import { baseUrl, verifyTrafficLightState } from "./constants";

type TrafficState = "green" | "yellow" | "red";

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
