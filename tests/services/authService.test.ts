import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("@/router", () => ({
  default: { push: vi.fn() },
}));

import api from "@/lib/api";
import { authService } from "@/services/authService";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login sends credentials and returns token", async () => {
    const mockToken = {
      access_token: "token",
      token_type: "bearer",
      expires_in: 3600,
    };
    vi.mocked(api.post).mockResolvedValue({ data: { data: mockToken } });

    const result = await authService.login({
      email: "test@test.com",
      password: "pass",
    });

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@test.com",
      password: "pass",
    });
    expect(result.access_token).toBe("token");
  });

  it("me returns user data", async () => {
    const mockUser = {
      id: 1,
      name: "Test",
      email: "test@test.com",
      role: "admin",
      created_at: "",
      updated_at: "",
    };
    vi.mocked(api.get).mockResolvedValue({ data: { data: mockUser } });

    const result = await authService.me();

    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(result.name).toBe("Test");
  });

  it("logout calls POST", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    await authService.logout();
    expect(api.post).toHaveBeenCalledWith("/auth/logout");
  });
});
