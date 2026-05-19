import { z } from "zod";

export const promotionRuleSchema = z.object({
  condition_type: z.string().min(1, "Condition type is required"),
  condition_value: z.string().min(1, "Condition value is required"),
  action_type: z.string().min(1, "Action type is required"),
  action_value: z.string().min(1, "Action value is required"),
  condition_variants: z.array(z.string()).optional(),
  condition_categories: z.array(z.string()).optional(),
  action_variants: z.array(z.string()).optional(),
  action_categories: z.array(z.string()).optional(),
});

export const promotionSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  is_stackable: z.boolean().default(false),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  branches: z.array(z.string()).min(1, "At least one branch must be selected"),
  rules: z.array(promotionRuleSchema).min(1, "At least one promotion rule must be defined"),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.end_date) >= new Date(data.start_date);
  }
  return true;
}, {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

export type PromotionSchemaInput = z.infer<typeof promotionSchema>;
