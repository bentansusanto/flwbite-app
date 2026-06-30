import { z } from "zod";

// Schema untuk setiap variant produk
export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama varian wajib diisi"),
  sku: z
    .string()
    .regex(/^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}-[A-Z0-9]{4}$/, "Format SKU tidak valid (cth: RTL-KAO-LAR-A8F2)")
    .optional()
    .or(z.literal("")),
  price: z
    .coerce
    .number({ error: "Harga jual harus berupa angka" })
    .min(0, "Harga tidak boleh negatif"),
  cost_price: z
    .union([z.coerce.number().min(0, "Harga modal tidak boleh negatif"), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
  is_active: z.boolean().default(true),
});

// Schema utama produk
export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Kategori wajib dipilih"),
  type: z.enum(["retail", "f&b", "service"], {
    error: "Pilih tipe produk yang valid",
  }),
  is_stock_tracked: z.boolean().default(true),
  is_sell: z.boolean().default(true),
  image: z.string().optional(),
  variants: z
    .array(productVariantSchema)
    .min(1, "Minimal satu varian harus ditambahkan"),
});

export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductInput = z.infer<typeof productSchema>;
