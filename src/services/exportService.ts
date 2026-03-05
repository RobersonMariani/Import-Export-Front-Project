import api from "@/lib/api";
import type { ApiResponse, CreateExportPayload, Export } from "@/types";

export const exportService = {
  async create(payload: CreateExportPayload = {}): Promise<Export> {
    const body: Record<string, unknown> = {};
    if (payload.compressed !== undefined) body.compressed = payload.compressed;
    if (payload.filters) {
      const filters = Object.fromEntries(
        Object.entries(payload.filters).filter(
          ([, v]) => v !== undefined && v !== "",
        ),
      );
      if (Object.keys(filters).length > 0) body.filters = filters;
    }
    const response = await api.post<ApiResponse<Export>>("/exports", body);
    return response.data.data;
  },

  async get(id: string): Promise<Export> {
    const response = await api.get<ApiResponse<Export>>(`/exports/${id}`);
    return response.data.data;
  },

  async download(id: string): Promise<string> {
    const response = await api.get<ApiResponse<{ download_url: string }>>(
      `/exports/${id}/download`,
    );
    return response.data.data.download_url;
  },
};
