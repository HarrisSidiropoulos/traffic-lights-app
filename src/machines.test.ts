import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { trafficLightMachine, pedestrianLightMachine } from "./machines";
import { createActor } from "xstate";
import { vi } from "vitest";

describe("machines", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("pedestrianLightMachine", () => {
    it("should handle pedestrian light changes", () => {
      const pedestrianLightActor = createActor(pedestrianLightMachine).start();

      // Initial state should be dontWalk
      expect(pedestrianLightActor.getSnapshot().value).toBe("dontWalk");

      // Send SAFE_TO_WALK event, should transition to walk
      pedestrianLightActor.send({ type: "SAFE_TO_WALK" });
      expect(pedestrianLightActor.getSnapshot().value).toBe("walk");

      // Send UNSAFE_TO_WALK event, should transition back to dontWalk
      pedestrianLightActor.send({ type: "UNSAFE_TO_WALK" });
      expect(pedestrianLightActor.getSnapshot().value).toBe("dontWalk");

      pedestrianLightActor.stop();
    });
  });

  describe("trafficLightMachine", () => {
    it("should handle pedestrian requests and traffic light changes", () => {
      const trafficLightActor = createActor(trafficLightMachine).start();

      // Initial state should be green
      expect(trafficLightActor.getSnapshot().value).toBe("green");

      // After 5 seconds, it should transition to yellow
      vi.advanceTimersByTime(5000);
      expect(trafficLightActor.getSnapshot().value).toBe("yellow");

      // After 2 seconds, it should transition to red
      vi.advanceTimersByTime(2000);
      expect(trafficLightActor.getSnapshot().value).toBe("red");

      // After 6 seconds, it should transition back to green
      vi.advanceTimersByTime(6000);
      expect(trafficLightActor.getSnapshot().value).toBe("green");

      // Send a pedestrian request while green
      trafficLightActor.send({ type: "PEDESTRIAN_REQUEST" });
      expect(trafficLightActor.getSnapshot().value).toBe("yellow");

      // After 2 seconds, it should transition to red
      vi.advanceTimersByTime(2000);
      expect(trafficLightActor.getSnapshot().value).toBe("red");

      // After 6 seconds, it should transition back to green
      vi.advanceTimersByTime(6000);
      expect(trafficLightActor.getSnapshot().value).toBe("green");

      trafficLightActor.stop();
    });
  });
});
