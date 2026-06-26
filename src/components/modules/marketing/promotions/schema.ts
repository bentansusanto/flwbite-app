import { z } from "zod";

export const promotionRuleSchema = z.object({
  condition_type: z.string().min(1, "Tipe kondisi wajib diisi"),
  condition_value: z.string().min(1, "Nilai kondisi wajib diisi"),
  action_type: z.string().min(1, "Tipe aksi wajib diisi"),
  action_value: z.string().min(1, "Nilai aksi wajib diisi"),
  condition_variants: z.array(z.string()).optional(),
  condition_categories: z.array(z.string()).optional(),
  action_variants: z.array(z.string()).optional(),
  action_categories: z.array(z.string()).optional(),
});

export const promotionSchema = z.object({
  name: z.string().min(3, "Nama kampanye minimal 3 karakter"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  is_stackable: z.boolean().default(false),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().min(1, "Tanggal selesai wajib diisi"),
  branches: z.array(z.string()).min(1, "Minimal satu cabang harus dipilih"),
  rules: z.array(promotionRuleSchema).min(1, "Minimal satu aturan promosi harus ditentukan"),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "Tanggal selesai harus sama atau setelah tanggal mulai",
  path: ["end_date"],
});

export type PromotionSchemaInput = z.infer<typeof promotionSchema>;
