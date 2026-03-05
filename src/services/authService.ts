import api from "@/lib/api";
import type { ApiResponse, AuthToken, AuthUser } from "@/types";
import type { LoginInput, RegisterInput } from "@/schemas/auth";

export const authService = {
  async login(data: LoginInput): Promise<AuthToken> {
    const response = await api.post<ApiResponse<AuthToken>>(
      "/auth/login",
      data,
    );
    return response.data.data;
  },

  async register(data: RegisterInput): Promise<AuthToken> {
    const response = await api.post<ApiResponse<AuthToken>>(
      "/auth/register",
      data,
    );
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async me(): Promise<AuthUser> {
    const response = await api.get<ApiResponse<AuthUser>>("/auth/me");
    return response.data.data;
  },

  async refresh(): Promise<AuthToken> {
    const response = await api.post<ApiResponse<AuthToken>>("/auth/refresh");
    return response.data.data;
  },
};
