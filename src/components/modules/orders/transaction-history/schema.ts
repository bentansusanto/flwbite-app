import { z } from "zod";

export const transactionFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().optional(),
  payment_method: z.string().optional(),
  branch_id: z.string().optional(),
  search: z.string().optional(),
});

export type TransactionFilterValues = z.infer<typeof transactionFilterSchema>;
