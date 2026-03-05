import api from "@/lib/api";
import type { ApiResponse, Health } from "@/types";

export const healthService = {
  async check(): Promise<Health> {
    const response = await api.get<ApiResponse<Health>>("/health");
    return response.data.data;
  },

  async metrics(): Promise<string> {
    const response = await api.get<string>("/metrics", {
      headers: { Accept: "text/plain" },
      responseType: "text",
    });
    return response.data;
  },
};
