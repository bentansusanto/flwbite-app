import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  role_id: z.string().min(1, "Role wajib dipilih"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});

export type UserInput = z.infer<typeof userSchema>;
