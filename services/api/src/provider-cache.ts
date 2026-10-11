export const DEFAULT_PROVIDER_TTL_MS = 15 * 60 * 1000;
export const PROVIDER_CACHE_LIMIT = 64;

type CacheEntry<T> = { expiresAt: number; value: T };

export class TtlCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly now: () => number,
    private readonly ttlMs: number,
    private readonly limit = PROVIDER_CACHE_LIMIT,
  ) {}

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry || entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.entries.delete(key);
    if (this.entries.size >= this.limit) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) {
        this.entries.delete(oldest);
      }
    }
    this.entries.set(key, { expiresAt: this.now() + this.ttlMs, value });
  }
}

export function providerRuntime(options?: {
  fetchImpl?: typeof fetch;
  now?: () => number;
  ttlMs?: number;
}): { fetchImpl: typeof fetch; now: () => number; ttlMs: number } {
  return {
    fetchImpl: options?.fetchImpl ?? fetch,
    now: options?.now ?? Date.now,
    ttlMs: options?.ttlMs ?? DEFAULT_PROVIDER_TTL_MS,
  };
}

export function describeProviderError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error";
  return message.replace(/api_?key=[^&\s]+/gi, "api_key=redacted");
}

export async function readProviderJson(fetchImpl: typeof fetch, url: URL): Promise<unknown> {
  const response = await fetchImpl(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Provider responded with HTTP ${response.status}`);
  }
  return response.json();
}
