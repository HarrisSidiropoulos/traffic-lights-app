import { setup, assign, type ActorRefFrom, sendParent } from "xstate";

// === Pedestrian Light Machine ===
type PedestrianLightEvent =
  | { type: "SAFE_TO_WALK" }
  | { type: "UNSAFE_TO_WALK" };

export type PedestrianLightMeta = {
  color: string | undefined;
};

export const pedestrianLightMachine = setup({
  types: {
    events: {} as PedestrianLightEvent,
  },
}).createMachine({
  id: "pedestrianLight",
  initial: "dontWalk",
  states: {
    dontWalk: {
      on: { SAFE_TO_WALK: "walk" },
    },
    walk: {
      on: { UNSAFE_TO_WALK: "dontWalk" },
    },
  },
});

// === Traffic Light Machine ===
type TrafficLightEvent = { type: "PEDESTRIAN_REQUEST" };

export const trafficLightMachine = setup({
  types: {
    events: {} as TrafficLightEvent,
  },
  actions: {
    TRAFFIC_GREEN: sendParent({ type: "TRAFFIC_GREEN" }),
    TRAFFIC_RED: sendParent({ type: "TRAFFIC_RED" }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAZpglgYwBkcoALZAOilTDADsBiABQFEARZgZQBUAlASQCCAOQD6PZgEUAqpy4BtAAwBdRKAAOAe1g5kODbVUgAHogBMCgKzkAnABYLp6xYAcChQHZzARgsAaEACeZrbu5JbWpubOEe4Wtl4AzAC+Sf5oWLiExGSU1HT0RrDI6Mhg5FilqAAUFm4KAJT06dj4RKQUVDS0iipIIJrauvqGJgjmVnYOTq4e3n6BZm7kpgm1Xo4W1l62pg4paRgtWe3kAWAANucaAO4FRSVlFWDV5m6NzZltOWeXNz2GAx0egMfVGcQU5Fc5gAbNDbLYEgkvMj-EExvFyEivNCfM5nND3O5kdD9iAPq1shRqBA7sVSuVMJUqtC6u9Dp9KeRqf8+oChiDQGDbBCoQpYfDEcivKjEM4vJjItYFNEIoiCRYUqkQLQNBA4IZyccyACtEDhqDEABaaEyhDWsJ1FZK5yraErBK2UmGr4dPIC-qm-kjRA7W1eTw2ZyxZwuBHC+IkrXezk-K7XE2DYHBhDwiGmKPuWwRbYKeHOW1OmzuaIJWLQ-ERUyJg4ZCknakZs3+0awhLkN3RrZF6KmCsKPvh9wE5zxBReGeFzVJIA */
  id: "trafficLight",
  initial: "green",
  states: {
    green: {
      after: { 5000: "yellow" },
      on: { PEDESTRIAN_REQUEST: "yellow" },
      entry: "TRAFFIC_GREEN",
    },
    yellow: {
      after: { 2000: "red" },
    },
    red: {
      after: {
        6000: "green",
      },
      entry: "TRAFFIC_RED",
    },
  },
});

// === Intersection Machine ===
type IntersectionMachineContext = {
  traffic: ActorRefFrom<typeof trafficLightMachine> | undefined;
  pedestrian: ActorRefFrom<typeof pedestrianLightMachine> | undefined;
};

type IntersectionEvent =
  | { type: "PEDESTRIAN_REQUEST" }
  | { type: "TRAFFIC_GREEN" }
  | { type: "TRAFFIC_RED" };

export const intersectionMachine = setup({
  types: {
    context: {} as IntersectionMachineContext,
    events: {} as IntersectionEvent,
  },
  actors: {
    traffic: trafficLightMachine,
    pedestrian: pedestrianLightMachine,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEsB2AXMAnWYDG6yA9qgMQAKAogCKUDKAKgEoCSAggHID6TlAigFV6DANoAGALqJQAByKxkhEtJAAPRAA4NAOgCsG3QCYtAZgAsYsxrNWANCACeiALQA2AJzbXAdhMBGA3ddbw93PxMAXwj7NEwcfCVUbSIZbABDRLSAG1JmNgAxfJYAYS4AcV5KDnEpJBA5BUSVdQQzV213Tq7uro1XeycEE0MTbW8xALENb0NvXV0TayiYjGxcAmIklPTMnLzCkp4aGpUGxU3mxGDtS3nxw3C+3T8xXQHEQ2NtM1mxOfmLJ1XGYotEQKgiBA4CpYmsEhc6mcmnUWs4-DcxJisdjMX4fu8EO4zNpZmZfP5fGZdGY-N5liBYfENiRkqksBlNtlTvJzsoUYgfNoTD4NCZdD4ye5vOECT9RlLXNS-O4JpiNKCIkA */
  id: "intersection",
  context: {
    traffic: undefined,
    pedestrian: undefined,
  },
  entry: assign({
    traffic: ({ spawn }) => spawn("traffic"),
    pedestrian: ({ spawn }) => spawn("pedestrian"),
  }),
  initial: "operational",
  states: {
    operational: {
      on: {
        TRAFFIC_GREEN: {
          actions: ({ context }) => {
            context.pedestrian?.send({ type: "UNSAFE_TO_WALK" });
          },
        },
        TRAFFIC_RED: {
          actions: ({ context }) => {
            context.pedestrian?.send({ type: "SAFE_TO_WALK" });
          },
        },
      },
    },
  },
  on: {
    PEDESTRIAN_REQUEST: {
      actions: ({ context }) => {
        context.traffic?.send({ type: "PEDESTRIAN_REQUEST" });
      },
    },
  },
});
