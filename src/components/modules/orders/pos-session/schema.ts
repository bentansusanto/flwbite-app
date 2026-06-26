import { z } from "zod";

export const posSessionSchema = z.object({
  branch_id: z.string().min(1, "Cabang wajib diisi"),
  opening_balance: z.number().min(0, "Saldo awal tidak boleh negatif"),
  note: z.string().optional(),
});

export const closeSessionSchema = z.object({
  closing_balance: z.number().min(0, "Saldo akhir tidak boleh negatif"),
  note: z.string().optional(),
});

export type PosSessionFormValues = z.infer<typeof posSessionSchema>;
export type CloseSessionFormValues = z.infer<typeof closeSessionSchema>;
