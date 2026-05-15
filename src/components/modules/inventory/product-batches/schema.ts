import { z } from "zod";

export const productBatchSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  variant_id: z.string().min(1, "Product variant is required"),
  supplier_id: z.string().optional().nullable().or(z.literal("")),
  batch_number: z.string().min(1, "Batch number is required"),
  production_date: z.string().optional().nullable().or(z.literal("")),
  expiry_date: z.string().optional().nullable().or(z.literal("")),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
});

export type ProductBatchInput = z.infer<typeof productBatchSchema>;
