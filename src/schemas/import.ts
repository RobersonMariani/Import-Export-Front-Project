import { z } from "zod";

export const importQuerySchema = z.object({
  status: z
    .enum(["queued", "processing", "partial", "completed", "failed"])
    .optional()
    .or(z.literal("")),
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export type ImportQueryInput = z.infer<typeof importQuerySchema>;
