import React, { useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useAddStockModal } from "./hooks";

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: any[];
}

export default function AddStockModal({ isOpen, onClose, branches }: AddStockModalProps) {
  const { formik, isUpdating, products, isLoadingProducts } = useAddStockModal(onClose);

  // Derive variants from the selected product
  const selectedProduct = useMemo(() => {
    return products.find((p: any) => p.id === formik.values.product_id);
  }, [products, formik.values.product_id]);

  const variants = selectedProduct?.variants || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Add Stock
        </h3>
        
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <Select
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
              value={formik.values.branch_id}
              onChange={(value) => formik.setFieldValue("branch_id", value)}
              placeholder="Select Branch"
            />
            {formik.touched.branch_id && formik.errors.branch_id && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.branch_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product <span className="text-red-500">*</span>
            </label>
            <Select
              options={products.map((p: any) => ({ value: p.id, label: p.name }))}
              value={formik.values.product_id}
              onChange={(value) => {
                formik.setFieldValue("product_id", value);
                formik.setFieldValue("variant_id", ""); // reset variant when product changes
              }}
              placeholder={isLoadingProducts ? "Loading products..." : "Select Product"}
            />
            {formik.touched.product_id && formik.errors.product_id && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.product_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Variant <span className="text-red-500">*</span>
            </label>
            <Select
              options={variants.map((v: any) => ({ value: v.id, label: v.name }))}
              value={formik.values.variant_id}
              onChange={(value) => formik.setFieldValue("variant_id", value)}
              placeholder={!formik.values.product_id ? "Select a product first" : "Select Variant"}
            />
            {formik.touched.variant_id && formik.errors.variant_id && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.variant_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount to Add <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="0"
              name="amount"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="1"
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.amount}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => {
                formik.resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isUpdating}
              loading={isUpdating}
            >
              Add Stock
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
