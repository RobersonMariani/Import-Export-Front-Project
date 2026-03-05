import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useNotificationStore } from "@/stores/notification";

describe("useNotificationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  it("adds and auto-removes notifications", () => {
    const store = useNotificationStore();
    store.success("Test message");
    expect(store.notifications).toHaveLength(1);
    expect(store.notifications[0]!.type).toBe("success");
    expect(store.notifications[0]!.message).toBe("Test message");

    vi.advanceTimersByTime(5000);
    expect(store.notifications).toHaveLength(0);
  });

  it("manually removes a notification", () => {
    const store = useNotificationStore();
    store.error("Error msg");
    const id = store.notifications[0]!.id;
    store.remove(id);
    expect(store.notifications).toHaveLength(0);
  });

  it("adds different types", () => {
    const store = useNotificationStore();
    store.success("s");
    store.error("e");
    store.warning("w");
    store.info("i");
    expect(store.notifications).toHaveLength(4);
    expect(store.notifications.map((n) => n.type)).toEqual([
      "success",
      "error",
      "warning",
      "info",
    ]);
  });
});
