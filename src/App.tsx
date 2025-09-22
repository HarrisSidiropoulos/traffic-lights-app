import { useMachine, useSelector } from "@xstate/react";
import classNames from "classnames";
import { trafficLightMachine, pedestrianLightMachine } from "./machines";
import "./App.css";

export default function App() {
  const [traffic, send] = useMachine(trafficLightMachine);
  const pedestrianState = useSelector(
    traffic.context.pedestrian,
    (state) => state!.value
  );

  return (
    <div className="app">
      <h1>🚦 Traffic Light Simulation</h1>

      <div className="lights-container">
        {/* Traffic Light */}
        <div>
          <h2>Traffic</h2>
          <div className="traffic-light">
            {Object.entries(trafficLightMachine.states)
              .reverse()
              .map(([state]) => (
                <div
                  key={state}
                  data-testid={`traffic-${state}`}
                  className={classNames("light", {
                    [state]: traffic.value === state,
                    inactive: traffic.value !== state,
                  })}
                />
              ))}
          </div>
        </div>

        {/* Pedestrian Light */}
        <div>
          <h2>Pedestrian</h2>
          <div className="pedestrian-light">
            {Object.entries(pedestrianLightMachine.states).map(([state]) => (
              <div
                key={state}
                data-testid={`pedestrian-${state}`}
                className={classNames("light", {
                  [state]: pedestrianState === state,
                  inactive: pedestrianState !== state,
                })}
              />
            ))}
          </div>
          <button
            className="pedestrian-btn"
            data-testid="pedestrian-btn"
            onClick={() => send({ type: "PEDESTRIAN_REQUEST" })}
          >
            🚶 Request Walk
          </button>
        </div>
      </div>
    </div>
  );
}
