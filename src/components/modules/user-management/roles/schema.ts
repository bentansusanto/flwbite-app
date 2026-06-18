import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi").max(50, "Nama role terlalu panjang"),
  description: z.string().max(255, "Deskripsi terlalu panjang").optional(),
  permissions: z.array(z.string()).min(1, "Minimal satu permission harus dipilih"),
});

export type RoleInput = z.infer<typeof roleSchema>;
