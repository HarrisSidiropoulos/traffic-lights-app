import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { intersectionMachine } from "./machines";
import { createActor } from "xstate";
import { vi } from "vitest";

describe("machines", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("intersectionMachine", () => {
    it("should handle pedestrian requests and traffic light changes", () => {
      const intersectionActor = createActor(intersectionMachine).start();

      const pedestrianLight =
        intersectionActor.getSnapshot().context.pedestrian!;
      const trafficLight = intersectionActor.getSnapshot().context.traffic!;

      expect(trafficLight.getSnapshot().value).toBe("green");
      expect(pedestrianLight.getSnapshot().value).toBe("dontWalk");

      intersectionActor.send({ type: "PEDESTRIAN_REQUEST" });
      expect(trafficLight.getSnapshot().value).toBe("yellow");

      vi.advanceTimersByTime(2000);
      expect(trafficLight.getSnapshot().value).toBe("red");
      expect(pedestrianLight.getSnapshot().value).toBe("walk");

      vi.advanceTimersByTime(6000);
      expect(trafficLight.getSnapshot().value).toBe("green");
      expect(pedestrianLight.getSnapshot().value).toBe("dontWalk");
    });
  });
});
