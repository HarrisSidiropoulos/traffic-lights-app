import type { Page } from "@playwright/test";
import { performAction, verifyTrafficLightState } from "./constants";

type TrafficState = keyof typeof verifyTrafficLightState;

export const verifyState = (state: string, page: Page) => {
  const stateVerifier = verifyTrafficLightState[state as TrafficState];
  return stateVerifier?.(page);
};

export const performEventAction = (eventType: string, page: Page) => {
  const actionFunction = performAction[eventType as keyof typeof performAction];
  return actionFunction?.(page);
};
