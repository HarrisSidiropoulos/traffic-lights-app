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
    it("should start in dontWalk state", () => {
      const pedestrianLightActor = createActor(pedestrianLightMachine).start();
      expect(pedestrianLightActor.getSnapshot().value).toBe("dontWalk");
      pedestrianLightActor.stop();
    });

    it("should transition to walk when receiving SAFE_TO_WALK event", () => {
      const pedestrianLightActor = createActor(pedestrianLightMachine).start();
      pedestrianLightActor.send({ type: "SAFE_TO_WALK" });
      expect(pedestrianLightActor.getSnapshot().value).toBe("walk");
      pedestrianLightActor.stop();
    });

    it("should transition back to dontWalk when receiving UNSAFE_TO_WALK event", () => {
      const pedestrianLightActor = createActor(pedestrianLightMachine).start();
      pedestrianLightActor.send({ type: "SAFE_TO_WALK" });
      pedestrianLightActor.send({ type: "UNSAFE_TO_WALK" });
      expect(pedestrianLightActor.getSnapshot().value).toBe("dontWalk");
      pedestrianLightActor.stop();
    });
  });

  describe("trafficLightMachine", () => {
    it("should start in green state", () => {
      const trafficLightActor = createActor(trafficLightMachine).start();
      expect(trafficLightActor.getSnapshot().value).toBe("green");
      trafficLightActor.stop();
    });

    it("should transition from green to yellow after 5 seconds", () => {
      const trafficLightActor = createActor(trafficLightMachine).start();
      vi.advanceTimersByTime(5000);
      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      trafficLightActor.stop();
    });

    it("should transition from yellow to red after 2 seconds", () => {
      const trafficLightActor = createActor(trafficLightMachine).start();
      vi.advanceTimersByTime(5000); // green to yellow
      vi.advanceTimersByTime(2000); // yellow to red
      expect(trafficLightActor.getSnapshot().value).toBe("red");
      trafficLightActor.stop();
    });

    it("should transition from red back to green after 6 seconds", () => {
      const trafficLightActor = createActor(trafficLightMachine).start();
      vi.advanceTimersByTime(5000); // green to yellow
      vi.advanceTimersByTime(2000); // yellow to red
      vi.advanceTimersByTime(6000); // red to green
      expect(trafficLightActor.getSnapshot().value).toBe("green");
      trafficLightActor.stop();
    });

    it("should transition from green to yellow when receiving pedestrian request", () => {
      const trafficLightActor = createActor(trafficLightMachine).start();
      trafficLightActor.send({ type: "PEDESTRIAN_REQUEST" });
      expect(trafficLightActor.getSnapshot().value).toBe("yellow");
      trafficLightActor.stop();
    });

    it("should complete full cycle after pedestrian request", () => {
      const trafficLightActor = createActor(trafficLightMachine).start();

      // Should be green initially
      expect(trafficLightActor.getSnapshot().value).toBe("green");

      // Send pedestrian request
      trafficLightActor.send({ type: "PEDESTRIAN_REQUEST" });

      // Should be yellow after pedestrian request
      expect(trafficLightActor.getSnapshot().value).toBe("yellow");

      // Should transition to red after 2 seconds
      vi.advanceTimersByTime(2000);
      expect(trafficLightActor.getSnapshot().value).toBe("red");

      // Should transition back to green after 6 seconds
      vi.advanceTimersByTime(6000);
      expect(trafficLightActor.getSnapshot().value).toBe("green");

      trafficLightActor.stop();
    });
  });
});
