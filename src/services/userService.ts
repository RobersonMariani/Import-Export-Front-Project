import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  UserFilters,
} from "@/types";
import type { CreateUserInput, UpdateUserInput } from "@/schemas/user";

export const userService = {
  async list(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""),
    );
    const response = await api.get<PaginatedResponse<User>>("/users", {
      params,
    });
    return response.data;
  },

  async get(id: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  async create(data: CreateUserInput): Promise<User> {
    const response = await api.post<ApiResponse<User>>("/users", data);
    return response.data.data;
  },

  async update(id: number, data: UpdateUserInput): Promise<User> {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined && v !== ""),
    );
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
