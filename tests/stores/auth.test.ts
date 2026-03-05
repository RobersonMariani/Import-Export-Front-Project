import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

vi.mock("@/services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock("@/router", () => ({
  default: { push: vi.fn() },
}));

import { authService } from "@/services/authService";
import router from "@/router";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("initializes with no token", () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
  });

  it("initializes with stored token", () => {
    localStorage.setItem("token", "stored-token");
    const store = useAuthStore();
    store.initialize();
    expect(store.token).toBe("stored-token");
  });

  it("login saves token and redirects", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      access_token: "test-token",
      token_type: "bearer",
      expires_in: 3600,
      user: {
        id: 1,
        name: "Test",
        email: "test@test.com",
        role: "admin",
        created_at: "",
        updated_at: "",
      },
    });
    vi.mocked(authService.me).mockResolvedValue({
      id: 1,
      name: "Test",
      email: "test@test.com",
      role: "admin",
      created_at: "",
      updated_at: "",
    });

    const store = useAuthStore();
    await store.login({ email: "test@test.com", password: "password" });

    expect(store.token).toBe("test-token");
    expect(store.isAuthenticated).toBe(true);
    expect(localStorage.getItem("token")).toBe("test-token");
    expect(router.push).toHaveBeenCalledWith({ name: "dashboard" });
  });

  it("logout clears state", async () => {
    vi.mocked(authService.logout).mockResolvedValue();
    localStorage.setItem("token", "test-token");

    const store = useAuthStore();
    store.token = "test-token";
    await store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(router.push).toHaveBeenCalledWith({ name: "login" });
  });
});
