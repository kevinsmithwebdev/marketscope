import { describe, expect, it } from "vitest";
import { normalizeObservations } from "./normalize-observations";
import { ECONOMY_SERIES } from "./series";

describe("normalizeObservations", () => {
  it("drops missing fred values", () => {
    const series = normalizeObservations(ECONOMY_SERIES.unemployment, {
      observations: [
        { date: "2024-01-01", value: "4.1" },
        { date: "2024-02-01", value: "." },
      ],
    });

    expect(series.points).toEqual([{ date: "2024-01-01", value: 4.1 }]);
    expect(series.seriesId).toBe("UNRATE");
    expect(series.source).toBe("fred");
  });
});
