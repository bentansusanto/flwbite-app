import { z } from "zod";

export const taxSchema = z.object({
  name: z.string().min(1, "Nama pajak wajib diisi").max(100, "Nama pajak maksimal 100 karakter"),
  value: z.preprocess(
    (val) => (typeof val === "string" && val.trim() !== "" ? parseFloat(val) : val),
    z.number({ message: "Rate harus berupa angka" })
      .min(0, "Rate minimal 0%")
      .max(100, "Rate maksimal 100%")
  ),
  is_active: z.boolean().default(true),
});

export type TaxInput = z.infer<typeof taxSchema>;
