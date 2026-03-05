import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Senhas não conferem",
    path: ["password_confirmation"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
