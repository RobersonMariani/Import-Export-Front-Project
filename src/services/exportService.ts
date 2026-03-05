import api from "@/lib/api";
import type {
  ApiResponse,
  CreateExportPayload,
  Export,
  PaginatedResponse,
} from "@/types";

export const exportService = {
  async list(
    params: Record<string, string | number | undefined> = {},
  ): Promise<PaginatedResponse<Export>> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    );
    const response = await api.get<PaginatedResponse<Export>>("/exports", {
      params: cleanParams,
    });
    return response.data;
  },

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

  async download(id: string): Promise<void> {
    const response = await api.get(`/exports/${id}/download`, {
      responseType: "blob",
    });
    const contentDisposition = response.headers["content-disposition"] ?? "";
    const match = contentDisposition.match(/filename="?(.+?)"?$/);
    const filename = match?.[1] ?? `export-${id}.csv`;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/exports/${id}`);
  },

  async retry(id: string): Promise<Export> {
    const response = await api.post<ApiResponse<Export>>(
      `/exports/${id}/retry`,
    );
    return response.data.data;
  },
};
