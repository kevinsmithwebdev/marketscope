import { describe, expect, it } from "vitest";
import { TtlCache } from "./provider-cache";

describe("TtlCache", () => {
  it("drops the oldest entry when the cap is reached", () => {
    const now = 0;
    const cache = new TtlCache<string>(() => now, 1000, 2);
    cache.set("a", "one");
    cache.set("b", "two");
    cache.set("c", "three");

    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe("two");
    expect(cache.get("c")).toBe("three");
  });

  it("forgets an entry after it expires", () => {
    let now = 0;
    const cache = new TtlCache<string>(() => now, 1000, 2);
    cache.set("a", "one");
    now = 1000;

    expect(cache.get("a")).toBeUndefined();
  });
});
