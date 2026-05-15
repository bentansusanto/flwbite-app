import { z } from "zod";

export const staffLoginSchema = z.object({
  identifier: z.string().min(1, "Email atau Username harus diisi"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  domain: z.string().min(1, "Domain tenant wajib ada"),
});

export const cashierLoginSchema = z.object({
  pin: z.string().length(6, "PIN harus 6 digit"),
  domain: z.string().min(1, "Domain tenant wajib ada"),
});

export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type CashierLoginInput = z.infer<typeof cashierLoginSchema>;
