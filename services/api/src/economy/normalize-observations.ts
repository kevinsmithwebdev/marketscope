import type { EconomySeries } from "@marketscope/types";
import type { EconomySeriesDefinition } from "./series";

export type { EconomySeries };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeObservations(
  definition: EconomySeriesDefinition,
  payload: unknown,
): EconomySeries {
  if (!isRecord(payload)) {
    throw new Error("Economy provider returned an unreadable response");
  }

  if (typeof payload.error_message === "string") {
    throw new Error(payload.error_message);
  }

  if (!Array.isArray(payload.observations)) {
    throw new Error("Economy provider did not return observations");
  }

  const points = payload.observations.flatMap((observation) => {
    if (
      !isRecord(observation) ||
      typeof observation.date !== "string" ||
      typeof observation.value !== "string"
    ) {
      return [];
    }
    if (observation.value === ".") {
      return [];
    }
    const value = Number(observation.value);
    if (!Number.isFinite(value)) {
      return [];
    }
    return [{ date: observation.date, value }];
  });

  if (points.length === 0) {
    throw new Error("Economy provider did not return observations");
  }

  return {
    id: definition.id,
    title: definition.title,
    unit: definition.unit,
    source: "fred",
    seriesId: definition.seriesId,
    points,
  };
}
