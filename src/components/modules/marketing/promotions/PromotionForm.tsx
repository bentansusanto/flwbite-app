"use client";

import React, { useMemo } from "react";
import { useFormik } from "formik";
import { validateWithZod } from "@/utils/formik-zod";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import { promotionSchema, PromotionSchemaInput } from "./schema";
import { Promotion } from "@/store/api/promotionApi";

interface PromotionFormProps {
  initialData: Promotion | null;
  branches: any[];
  products: any[];
  categories: any[];
  isLoading: boolean;
  onSubmit: (values: PromotionSchemaInput) => Promise<void>;
  onCancel: () => void;
}

export default function PromotionForm({
  initialData,
  branches,
  products,
  categories,
  isLoading,
  onSubmit,
  onCancel
}: PromotionFormProps) {
  // Extract all variants from products
  const productVariants = useMemo(() => {
    const list: { id: string; name: string; productName: string }[] = [];
    products.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          list.push({
            id: v.id,
            name: v.name || "Default",
            productName: p.name,
          });
        });
      }
    });
    return list;
  }, [products]);

  // Format initial values
  const initialValues: PromotionSchemaInput = useMemo(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        description: initialData.description || "",
        status: (initialData.status === "EXPIRED" ? "ACTIVE" : initialData.status) as "ACTIVE" | "INACTIVE",
        is_stackable: initialData.is_stackable ?? false,
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split("T")[0] : "",
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split("T")[0] : "",
        branches: initialData.branches || [],
        rules: (initialData.rules || []).map((r) => {
          // Parse dynamic JSON strings to standard values for form display
          let condVal = r.condition_value || "";
          try {
            condVal = JSON.parse(r.condition_value);
          } catch (e) {
            // keep as is
          }
          let actVal = r.action_value || "";
          try {
            actVal = JSON.parse(r.action_value);
          } catch (e) {
            // keep as is
          }

          return {
            condition_type: r.condition_type || "MIN_QTY",
            condition_value: String(condVal),
            action_type: r.action_type || "DISCOUNT_PERCENT",
            action_value: String(actVal),
            condition_variants: r.condition_variants || [],
            condition_categories: r.condition_categories || [],
            action_variants: r.action_variants || [],
            action_categories: r.action_categories || [],
          };
        }),
      };
    }
    return {
      name: "",
      description: "",
      status: "ACTIVE",
      is_stackable: false,
      start_date: "",
      end_date: "",
      branches: [],
      rules: [
        {
          condition_type: "MIN_QTY",
          condition_value: "",
          action_type: "DISCOUNT_PERCENT",
          action_value: "",
          condition_variants: [],
          condition_categories: [],
          action_variants: [],
          action_categories: [],
        }
      ],
    };
  }, [initialData]);

  const formik = useFormik<PromotionSchemaInput>({
    initialValues,
    validate: validateWithZod(promotionSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const handleAddRule = () => {
    const currentRules = [...formik.values.rules];
    currentRules.push({
      condition_type: "MIN_QTY",
      condition_value: "",
      action_type: "DISCOUNT_PERCENT",
      action_value: "",
      condition_variants: [],
      condition_categories: [],
      action_variants: [],
      action_categories: [],
    });
    formik.setFieldValue("rules", currentRules);
  };

  const handleRemoveRule = (index: number) => {
    if (formik.values.rules.length <= 1) return;
    const currentRules = [...formik.values.rules];
    currentRules.splice(index, 1);
    formik.setFieldValue("rules", currentRules);
  };

  const handleBranchToggle = (branchId: string) => {
    const currentBranches = [...formik.values.branches];
    const index = currentBranches.indexOf(branchId);
    if (index > -1) {
      currentBranches.splice(index, 1);
    } else {
      currentBranches.push(branchId);
    }
    formik.setFieldValue("branches", currentBranches);
  };

  const handleRuleMultiSelectToggle = (ruleIndex: number, field: string, itemId: string) => {
    const rules = [...formik.values.rules];
    const currentList = rules[ruleIndex][field as keyof typeof rules[0]] as string[] || [];
    const newList = [...currentList];
    const index = newList.indexOf(itemId);
    if (index > -1) {
      newList.splice(index, 1);
    } else {
      newList.push(itemId);
    }
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      [field]: newList,
    };
    formik.setFieldValue("rules", rules);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col h-full max-h-[85vh]">
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[calc(85vh-160px)] no-scrollbar">
        {/* Campaign Details */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md space-y-4 shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">Campaign Information</h4>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label required>Campaign Name</Label>
            <InputField
              placeholder="e.g. Coffee Lovers Discount"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={!!(formik.touched.name && formik.errors.name)}
              hint={formik.touched.name && formik.errors.name ? String(formik.errors.name) : undefined}
            />
          </div>
          <div className="flex flex-col justify-end pb-2">
            <Label required>Status</Label>
            <div className="mt-2.5">
              <Switch
                label={formik.values.status === "ACTIVE" ? "Active" : "Inactive"}
                checked={formik.values.status === "ACTIVE"}
                onChange={(checked) => formik.setFieldValue("status", checked ? "ACTIVE" : "INACTIVE")}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label required>Start Date</Label>
            <InputField
              type="date"
              name="start_date"
              value={formik.values.start_date}
              onChange={formik.handleChange}
              error={!!(formik.touched.start_date && formik.errors.start_date)}
              hint={formik.touched.start_date && formik.errors.start_date ? String(formik.errors.start_date) : undefined}
            />
          </div>
          <div>
            <Label required>End Date</Label>
            <InputField
              type="date"
              name="end_date"
              value={formik.values.end_date}
              onChange={formik.handleChange}
              error={!!(formik.touched.end_date && formik.errors.end_date)}
              hint={formik.touched.end_date && formik.errors.end_date ? String(formik.errors.end_date) : undefined}
            />
          </div>
        </div>

        <div>
          <Label>Campaign Description</Label>
          <TextArea
            placeholder="Write details about the discount terms..."
            value={formik.values.description}
            onChange={(val) => formik.setFieldValue("description", val)}
          />
        </div>

        <div className="flex items-center gap-6 pt-2 border-t border-gray-50 dark:border-gray-850">
          <Switch
            label="Allow stacking with other campaigns"
            checked={formik.values.is_stackable}
            onChange={(checked) => formik.setFieldValue("is_stackable", checked)}
          />
        </div>
      </div>

      {/* Target Branches */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">Target Branches</h4>
          <span className="text-xs text-red-500">{formik.errors.branches ? String(formik.errors.branches) : ""}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {branches.map((b) => (
            <label
              key={b.id}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                formik.values.branches.includes(b.id)
                  ? "border-brand-500 bg-brand-50/20 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-400"
                  : "border-gray-100 bg-gray-50/20 text-gray-700 hover:border-gray-200 dark:border-white/5 dark:bg-white/[0.01] dark:text-gray-400"
              }`}
            >
              <input
                type="checkbox"
                checked={formik.values.branches.includes(b.id)}
                onChange={() => handleBranchToggle(b.id)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <div className="text-sm font-semibold">{b.name}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Rules Builder */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">Promotion Rules</h4>
            <p className="text-xs text-gray-400">Configure conditional rules for when this discount is triggered.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            startIcon={<Plus size={16} />}
            onClick={handleAddRule}
          >
            Add Rule
          </Button>
        </div>

        {formik.values.rules.map((rule, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-gray-100 bg-gray-50/20 dark:border-white/5 dark:bg-white/[0.01] space-y-5 relative"
          >
            {formik.values.rules.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveRule(idx)}
                className="absolute right-4 top-4 text-gray-400 hover:text-error-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="text-sm font-bold text-brand-600 dark:text-brand-400">Rule #{idx + 1}</div>

            {/* Condition Section */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Condition Trigger</h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Condition Type</Label>
                  <select
                    value={rule.condition_type}
                    onChange={(e) => {
                      const rules = [...formik.values.rules];
                      rules[idx].condition_type = e.target.value;
                      // Clear values when changing type
                      rules[idx].condition_value = "";
                      formik.setFieldValue("rules", rules);
                    }}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="MIN_QTY">Minimum Quantity of Items</option>
                    <option value="MIN_PURCHASE">Minimum Purchase Amount (Rp)</option>
                    <option value="BUY_X_GET_Y">Buy X (Condition Qty)</option>
                    <option value="NEW_CUSTOMER">New Customer Only</option>
                    <option value="PRODUCT_CATEGORY">Product Category Only</option>
                    <option value="SPECIFIC_ITEMS">Specific Products/Variants</option>
                  </select>
                </div>
                <div>
                  <Label>Condition Value</Label>
                  {rule.condition_type === "NEW_CUSTOMER" ? (
                    <select
                      value={rule.condition_value}
                      onChange={(e) => {
                        const rules = [...formik.values.rules];
                        rules[idx].condition_value = e.target.value;
                        formik.setFieldValue("rules", rules);
                      }}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Select option</option>
                      <option value="true">True</option>
                    </select>
                  ) : rule.condition_type === "PRODUCT_CATEGORY" || rule.condition_type === "SPECIFIC_ITEMS" ? (
                    <select
                      value={rule.condition_value}
                      onChange={(e) => {
                        const rules = [...formik.values.rules];
                        rules[idx].condition_value = e.target.value;
                        formik.setFieldValue("rules", rules);
                      }}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="true">Apply to selected filters</option>
                    </select>
                  ) : (
                    <InputField
                      type="number"
                      placeholder={rule.condition_type === "MIN_PURCHASE" ? "e.g. 50000" : "e.g. 3"}
                      value={rule.condition_value}
                      onChange={(e) => {
                        const rules = [...formik.values.rules];
                        rules[idx].condition_value = e.target.value;
                        formik.setFieldValue("rules", rules);
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Conditional Relational Pickers */}
              {rule.condition_type === "SPECIFIC_ITEMS" && (
                <div>
                  <Label>Filter Condition Products/Variants</Label>
                  <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-gray-100 bg-white dark:border-white/5 dark:bg-gray-950">
                    {productVariants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleRuleMultiSelectToggle(idx, "condition_variants", v.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          (rule.condition_variants || []).includes(v.id)
                            ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {v.productName} ({v.name})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {rule.condition_type === "PRODUCT_CATEGORY" && (
                <div>
                  <Label>Filter Condition Product Categories</Label>
                  <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-gray-100 bg-white dark:border-white/5 dark:bg-gray-950">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleRuleMultiSelectToggle(idx, "condition_categories", c.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          (rule.condition_categories || []).includes(c.id)
                            ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Section */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Awarded Action</h5>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Action Type</Label>
                  <select
                    value={rule.action_type}
                    onChange={(e) => {
                      const rules = [...formik.values.rules];
                      rules[idx].action_type = e.target.value;
                      rules[idx].action_value = "";
                      formik.setFieldValue("rules", rules);
                    }}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="DISCOUNT_PERCENT">Percentage Discount (%)</option>
                    <option value="DISCOUNT_AMOUNT">Amount Discount (Rp)</option>
                    <option value="FREE_ITEM">Free Item Quantity (Qty)</option>
                    <option value="FIXED_PRICE">Fixed Bundle Price (Rp)</option>
                  </select>
                </div>
                <div>
                  <Label>Action Value</Label>
                  <InputField
                    type="number"
                    placeholder={rule.action_type === "DISCOUNT_PERCENT" ? "e.g. 20" : "e.g. 15000"}
                    value={rule.action_value}
                    onChange={(e) => {
                      const rules = [...formik.values.rules];
                      rules[idx].action_value = e.target.value;
                      formik.setFieldValue("rules", rules);
                    }}
                  />
                </div>
              </div>

              {/* Action relational selections if FREE_ITEM is chosen */}
              {rule.action_type === "FREE_ITEM" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Target Free Product Variants</Label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-gray-100 bg-white dark:border-white/5 dark:bg-gray-950">
                      {productVariants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleRuleMultiSelectToggle(idx, "action_variants", v.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                            (rule.action_variants || []).includes(v.id)
                              ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {v.productName} ({v.name})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Target Free Product Categories</Label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-gray-100 bg-white dark:border-white/5 dark:bg-gray-950">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleRuleMultiSelectToggle(idx, "action_categories", c.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                            (rule.action_categories || []).includes(c.id)
                              ? "bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/60 p-5 z-20 flex gap-3 justify-end rounded-b-2xl">
        <Button type="button" variant="outline" className="w-32" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="w-48" loading={isLoading}>
          {initialData ? "Update Campaign" : "Launch Campaign"}
        </Button>
      </div>
    </form>
  );
}
