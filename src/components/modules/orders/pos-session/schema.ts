import { z } from "zod";

export const posSessionSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  opening_balance: z.number().min(0, "Opening balance must be at least 0"),
  note: z.string().optional(),
});

export const closeSessionSchema = z.object({
  closing_balance: z.number().min(0, "Closing balance must be at least 0"),
  note: z.string().optional(),
});

export type PosSessionFormValues = z.infer<typeof posSessionSchema>;
export type CloseSessionFormValues = z.infer<typeof closeSessionSchema>;
