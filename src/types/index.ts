export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  birth_date: string | null;
  role: string;
  role_label: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  user?: AuthUser;
}

export interface Import {
  id: string;
  status: ImportStatus;
  status_label: string;
  progress: number;
  total_records: number;
  success_count: number;
  failure_count: number;
  original_filename: string;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  processing_time_seconds: number | null;
  estimated_remaining_seconds: number | null;
  created_at: string;
}

export interface Export {
  id: string;
  status: ExportStatus;
  status_label: string;
  total_records: number;
  compressed: boolean;
  file_path: string | null;
  error_message: string | null;
  download_url: string | null;
  expires_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  processing_time_seconds: number | null;
  created_at: string;
}

export interface HealthService {
  name: string;
  status: string;
  latency_ms: number | null;
}

export interface Health {
  status: string;
  status_label: string;
  services: Record<string, { status: string; latency_ms: number | null }>;
  timestamp: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: Pagination;
}

export interface ApiResponse<T> {
  data: T;
}

export type Role = "admin" | "manager" | "user";
export type ImportStatus =
  | "queued"
  | "processing"
  | "partial"
  | "completed"
  | "failed";
export type ExportStatus = "queued" | "processing" | "completed" | "failed";
export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "user", label: "Usuário" },
];

export const IMPORT_STATUS_OPTIONS: { value: ImportStatus; label: string }[] = [
  { value: "queued", label: "Na fila" },
  { value: "processing", label: "Processando" },
  { value: "partial", label: "Parcial" },
  { value: "completed", label: "Concluído" },
  { value: "failed", label: "Falhou" },
];

export const EXPORT_STATUS_OPTIONS: { value: ExportStatus; label: string }[] = [
  { value: "queued", label: "Na fila" },
  { value: "processing", label: "Processando" },
  { value: "completed", label: "Concluído" },
  { value: "failed", label: "Falhou" },
];

export const STATUS_COLORS: Record<string, string> = {
  queued: "bg-info-50 text-info-600",
  processing: "bg-warning-50 text-warning-600",
  partial: "bg-warning-50 text-warning-600",
  completed: "bg-success-50 text-success-600",
  failed: "bg-danger-50 text-danger-600",
  healthy: "bg-success-50 text-success-600",
  degraded: "bg-warning-50 text-warning-600",
  unhealthy: "bg-danger-50 text-danger-600",
};

export interface UserFilters {
  search?: string;
  role?: Role | "";
  state?: string;
  city?: string;
  page?: number;
  per_page?: number;
  sort_by?: "name" | "email" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface ImportFilters {
  status?: ImportStatus | "";
  page?: number;
  per_page?: number;
}

export interface ExportFiltersPayload {
  search?: string;
  role?: Role | "";
  state?: string;
  city?: string;
}

export interface CreateExportPayload {
  filters?: ExportFiltersPayload;
  compressed?: boolean;
}
