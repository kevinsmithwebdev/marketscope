import type { CryptoAssetList, CryptoHistory } from "@marketscope/types";
import { simulationHeaders } from "@marketscope/ui";

const API_BASE_URL = "http://localhost:4000";

export const CRYPTO_STALE_TIME_MS = 15 * 60 * 1000;

export async function fetchAssets(): Promise<CryptoAssetList> {
  const list = await readJson<CryptoAssetList>(`${API_BASE_URL}/api/crypto/assets`);
  if (list.source !== "coingecko" || !Array.isArray(list.assets)) {
    throw new Error("Crypto data is unavailable");
  }
  return list;
}

export async function fetchCryptoHistory(id: string): Promise<CryptoHistory> {
  const history = await readJson<CryptoHistory>(
    `${API_BASE_URL}/api/crypto/${encodeURIComponent(id)}/history`,
  );
  if (history.source !== "coingecko" || !Array.isArray(history.points)) {
    throw new Error("Crypto data is unavailable");
  }
  return history;
}

async function readJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { headers: simulationHeaders() });
  } catch {
    throw new Error("MarketScope API is unavailable");
  }

  if (!response.ok) {
    throw new Error("Crypto data is unavailable");
  }

  return (await response.json()) as T;
}
