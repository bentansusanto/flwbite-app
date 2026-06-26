import { z } from "zod";

export const productBatchSchema = z.object({
  branch_id: z.string().min(1, "Cabang wajib diisi"),
  variant_id: z.string().min(1, "Varian produk wajib diisi"),
  supplier_id: z.string().optional().nullable().or(z.literal("")),
  batch_number: z.string().min(1, "Nomor batch wajib diisi"),
  production_date: z.string().optional().nullable().or(z.literal("")),
  expiry_date: z.string().optional().nullable().or(z.literal("")),
  quantity: z.coerce.number().min(0, "Kuantitas tidak boleh negatif"),
  unit: z.string().min(1, "Satuan wajib diisi"),
});

export type ProductBatchInput = z.infer<typeof productBatchSchema>;
