import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  phone: z
    .string()
    .max(20, "Telefone muito longo")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(255, "Endereço muito longo")
    .optional()
    .or(z.literal("")),
  city: z.string().max(100, "Cidade muito longa").optional().or(z.literal("")),
  state: z
    .string()
    .max(2, "UF deve ter 2 caracteres")
    .optional()
    .or(z.literal("")),
  zip_code: z.string().max(10, "CEP muito longo").optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  role: z.enum(["admin", "manager", "user"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255).optional(),
  email: z.string().email("E-mail inválido").optional(),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(2).optional().or(z.literal("")),
  zip_code: z.string().max(10).optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  role: z.enum(["admin", "manager", "user"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
