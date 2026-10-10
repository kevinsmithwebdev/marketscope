import type { EconomySeries, EconomySeriesId } from "@marketscope/types";
import { simulationHeaders } from "@marketscope/ui";

const API_BASE_URL = "http://localhost:4000";

export const ECONOMY_STALE_TIME_MS = 15 * 60 * 1000;

export async function fetchEconomySeries(id: EconomySeriesId): Promise<EconomySeries> {
  const series = await readJson<EconomySeries>(`${API_BASE_URL}/api/economy/${id}`);
  if (series.source !== "fred" || !Array.isArray(series.points)) {
    throw new Error("Economic data is unavailable");
  }
  return series;
}

async function readJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { headers: simulationHeaders() });
  } catch {
    throw new Error("MarketScope API is unavailable");
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as T;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // The body was not JSON.
  }
  return "Economic data is unavailable";
}
