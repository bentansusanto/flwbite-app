import { z } from "zod";

export const salesReportFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  branch_id: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(5),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]).default("weekly"),
});

export type SalesReportFilterValues = z.infer<typeof salesReportFilterSchema>;
