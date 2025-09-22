import { setup, assign, type ActorRefFrom } from "xstate";

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
  /** @xstate-layout N4IgpgJg5mDOIC5QAdJwC4CcCWBDAdgDLZQAW6AdBAPb7oDquANgNYDEAygIIBiAogH0AKgHkB9LoQDSAbQAMAXUQpqsbOmy1lIAB6IAjAHYAbBX3GAzABZLVq-oCsdgJwWANCACeB4wCYKVr5WhhYWABxWclZhYUEAvnEeqBAYOATEZJQA7szsAKoActz8wmIS0vJKSCDIquqa+Np6COYOZnIODr7G+ha+cn36Ht4IFnIUhr4WDoZWzmH6cnL6gQmJIPjUKfDVyal4RCTk2rVqGlrVzQC0xsOIVw6mDs6uDgNhxs6+kwlJaLBYA4ZchUWgMXInOrnRqXRCBO4IMKGChySZzXxfVF9Zz6X41f6A9JHbIQ3ZQhpNRAWT4USxyfphL4WQxfZwIxkUGZBBYDKzTL7GNZxIA */
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
type TrafficLightContext = {
  pedestrian: ActorRefFrom<typeof pedestrianLightMachine> | undefined;
};
type TrafficLightEvent = { type: "PEDESTRIAN_REQUEST" };

export const trafficLightMachine = setup({
  types: {
    context: {} as TrafficLightContext,
    events: {} as TrafficLightEvent,
  },
  actors: {
    pedestrian: pedestrianLightMachine,
  },
  actions: {
    notifyPedestrianUnsafe: assign({
      pedestrian: ({ context }) => {
        context.pedestrian?.send({ type: "UNSAFE_TO_WALK" });
        return context.pedestrian;
      },
    }),
    notifyPedestrianSafe: assign({
      pedestrian: ({ context }) => {
        context.pedestrian?.send({ type: "SAFE_TO_WALK" });
        return context.pedestrian;
      },
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAZpglgYwBkcoALZAOilTDADsBiABQFEARZgZQBUAlASQCCAOQD6PZgEUAqpy4BtAAwBdRKAAOAe1g5kODbVUgAHogBMCgKzkAnABYLp6xYAcChQHZzARgsAaEACeZrbu5JbWpubOEe4Wtl4AzAC+Sf5oWLiExGSU1HT0RrDI6Mhg5FilqAAUFm4KAJT06dj4RKQUVDS0iipIIJrauvqGJggJAGxe5O4J7uMJll7jsZb+QQhetuPk0QqmtrMJ1rO21ilpGC1Z7eQBYAA29xoA7gVFJWUVYNXmbo3NmTaOTujxePUMAx0egMfVGcQUOz2CnG41sBwSXkxa2CUwxSx8zmcy3cmPG5xAANa2Qo1Agb2KpXKmEqVXGdX+l0B1PItPBfUhQxhoDhtgRrnMKLRCTxXmxCGcuMi1gU0Qi0uWFhSqRAtA0EDghkp1zIEK0UOGsMQAFovHYwh5xtZrOMLONXIS-IFrQ4do4Di6Es59hYSWTtUagR08kL+mbBSNrZttm45k6XW6Vc5PesvKZQiTYkctsifAlbOSI9yQU9nqbBtCEwg0QjTM53O5TqZNgo0c45aYjjZ3NFZq6iRFTGGLhkqTdaXXzTHRiiEuRxnmXNZNtZoqZ+wpV1528tnPEFF5Tx2tUkgA */
  id: "trafficLight",
  initial: "green",
  context: {
    pedestrian: undefined,
  },
  entry: assign({
    pedestrian: ({ spawn }) => spawn("pedestrian"),
  }),
  states: {
    green: {
      after: { 5000: "yellow" },
      on: { PEDESTRIAN_REQUEST: "yellow" },
      entry: "notifyPedestrianUnsafe",
    },
    yellow: {
      after: { 2000: "red" },
    },
    red: {
      after: {
        6000: "green",
      },
      entry: "notifyPedestrianSafe",
    },
  },
});
