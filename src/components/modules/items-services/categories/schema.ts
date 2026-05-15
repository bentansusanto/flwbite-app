import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional(),
  category_type: z.enum(["retail", "f&b", "service"], {
    errorMap: () => ({ message: "Pilih tipe bisnis yang valid" }),
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
