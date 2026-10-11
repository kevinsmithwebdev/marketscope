import { describe, expect, it } from "vitest";
import { simulationEnabled } from "./simulation.interceptor";

describe("simulationEnabled", () => {
  it("follows NODE_ENV when the flag is unset", () => {
    expect(simulationEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(simulationEnabled({ NODE_ENV: "production" })).toBe(false);
  });

  it("lets the flag override the environment", () => {
    expect(simulationEnabled({ NODE_ENV: "production", MARKETSCOPE_SIMULATION: "1" })).toBe(true);
    expect(simulationEnabled({ NODE_ENV: "development", MARKETSCOPE_SIMULATION: "0" })).toBe(false);
  });
});
