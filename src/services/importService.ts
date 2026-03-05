import api from "@/lib/api";
import type {
  ApiResponse,
  Import,
  ImportFilters,
  PaginatedResponse,
} from "@/types";

export const importService = {
  async list(filters: ImportFilters = {}): Promise<PaginatedResponse<Import>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""),
    );
    const response = await api.get<PaginatedResponse<Import>>("/imports", {
      params,
    });
    return response.data;
  },

  async get(id: string): Promise<Import> {
    const response = await api.get<ApiResponse<Import>>(`/imports/${id}`);
    return response.data.data;
  },

  async create(file: File): Promise<Import> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ApiResponse<Import>>("/imports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },
};
