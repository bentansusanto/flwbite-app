import { z } from "zod";

const CATEGORY_TYPES = ["retail", "f&b", "service"] as const;

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional(),
  category_type: z.enum(CATEGORY_TYPES, "Pilih tipe bisnis yang valid"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
