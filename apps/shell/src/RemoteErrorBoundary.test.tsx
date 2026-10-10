import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RemoteErrorBoundary } from "./RemoteErrorBoundary";

function Boom(): never {
  throw new Error("boom");
}

describe("RemoteErrorBoundary", () => {
  it("shows a contained failure instead of taking down the shell", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <RemoteErrorBoundary name="Markets">
        <Boom />
      </RemoteErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: "Markets failed to load" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
