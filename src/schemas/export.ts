import { z } from "zod";

export const exportFiltersSchema = z.object({
  search: z.string().max(255).optional().or(z.literal("")),
  role: z.enum(["admin", "manager", "user"]).optional().or(z.literal("")),
  state: z.string().max(2).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
});

export const createExportSchema = z.object({
  filters: exportFiltersSchema.optional(),
  compressed: z.boolean().optional(),
});

export type ExportFiltersInput = z.infer<typeof exportFiltersSchema>;
export type CreateExportInput = z.infer<typeof createExportSchema>;
