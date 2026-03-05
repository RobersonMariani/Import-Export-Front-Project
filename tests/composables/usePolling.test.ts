import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("vue", async () => {
  const actual = await vi.importActual("vue");
  return { ...actual, onUnmounted: vi.fn() };
});

import { usePolling } from "@/composables/usePolling";

describe("usePolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts and stops polling", () => {
    const callback = vi.fn().mockResolvedValue(undefined);
    const { isPolling, start, stop } = usePolling(callback, 1000);

    expect(isPolling.value).toBe(false);
    start();
    expect(isPolling.value).toBe(true);

    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3);

    stop();
    expect(isPolling.value).toBe(false);

    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("does not start twice", () => {
    const callback = vi.fn().mockResolvedValue(undefined);
    const { start } = usePolling(callback, 1000);

    start();
    start();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
