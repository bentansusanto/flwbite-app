import { z } from "zod";

export const AddStockSchema = z.object({
  branch_id: z.string().min(1, "Cabang wajib dipilih"),
  product_id: z.string().min(1, "Produk wajib dipilih"),
  variant_id: z.string().min(1, "Varian wajib dipilih"),
  amount: z
    .number({
      message: "Jumlah stok harus berupa angka",
    })
    .positive("Jumlah stok harus lebih dari 0"),
});

export type AddStockFormValues = z.infer<typeof AddStockSchema>;
