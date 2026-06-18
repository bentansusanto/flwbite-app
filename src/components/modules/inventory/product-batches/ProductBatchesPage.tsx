"use client";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { validateWithZod } from "@/utils/formik-zod";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Edit2,
  Layers,
  Package,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useProductBatches } from "./hooks";
import { productBatchSchema } from "./schema";

export default function ProductBatchesPage() {
  const {
    selectedBranchId,
    setSelectedBranchId,
    search,
    setSearch,
    branches,
    isLoadingBranches,
    suppliers,
    products,
    filteredBatches,
    isLoadingBatches,
    handleSubmit,
    handleConfirmDelete,
    openDeleteAlert,
    closeDeleteAlert,
    isAlertOpen,
    isCreating,
    isUpdating,
    isDeleting
  } = useProductBatches();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  const handleOpenModal = (batch?: any) => {
    setSelectedBatch(batch || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBatch(null);
    setIsModalOpen(false);
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { label: "N/A", color: "bg-gray-50 text-gray-500 border-gray-100", icon: AlertCircle };

    const today = new Date();
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Expired", color: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20", icon: AlertTriangle };
    if (diffDays <= 30) return { label: "Expiring Soon", color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", icon: Clock };
    return { label: "Good Condition", color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20", icon: AlertCircle };
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Product Batches</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track expiry dates and manage stock lots efficiently.</p>
        </div>
        <Button onClick={() => handleOpenModal()} startIcon={<Plus size={18} />} className="shadow-lg shadow-indigo-500/20">
          Add New Batch
        </Button>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by batch #, product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-2xl border border-transparent bg-white px-10 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-white/5 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 dark:focus:ring-indigo-500/10 shadow-sm"
          />
        </div>

        <div className="relative">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full h-11 rounded-2xl border border-transparent bg-white px-10 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-white/5 dark:bg-gray-950 dark:text-white dark:focus:ring-indigo-500/10 appearance-none shadow-sm"
          >
            <option value="">All Branches</option>
            {branches.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Batches */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoadingBatches ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse space-y-4 dark:bg-gray-900 dark:border-gray-800">
              <div className="flex justify-between">
                <div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                <div className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
              </div>
              <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
            </div>
          ))
        ) : filteredBatches.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center mb-4 border border-gray-100 dark:border-white/5">
                <Layers className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white">Tidak ada data Batch</p>
              <p className="text-sm mt-1 max-w-sm">Data batch produk tidak ditemukan. Pastikan filter pencarian sudah benar.</p>
            </div>
          </div>
        ) : (
          filteredBatches.map((batch: any) => {
            const status = getExpiryStatus(batch.expiry_date);
            const StatusIcon = status.icon;

            return (
              <div key={batch.id} className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-6 rounded-3xl border border-gray-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-50/50 dark:hover:shadow-indigo-500/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 -mr-12 -mt-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity dark:bg-indigo-500/10"></div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md w-fit mb-2 dark:bg-indigo-500/20">
                      {batch.batch_number}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 dark:text-white dark:group-hover:text-indigo-400">{batch.product_name}</h3>
                    <p className="text-sm text-gray-500 font-medium dark:text-gray-400">{batch.variant_name}</p>
                    {batch.supplier_name && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {batch.supplier_name}
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 relative z-10 dark:border-gray-800">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock Level</p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{batch.quantity} {batch.unit || "pcs"}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</p>
                    <div className="flex items-center justify-end gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {batch.expiry_date ? format(new Date(batch.expiry_date), "dd MMM yyyy") : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center dark:bg-gray-800">
                      <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 truncate max-w-[120px] dark:text-gray-400">
                      {branches.find((b: any) => b.id === batch.branch_id)?.name || "Warehouse"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(batch)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all dark:hover:bg-indigo-500/20"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteAlert(batch.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all dark:hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Batch Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        className="max-w-[580px] p-0 overflow-hidden dark:bg-gray-900"
      >
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedBatch ? "Edit Batch" : "Add New Batch"}
          </h2>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            Please fill in the batch information carefully.
          </p>
        </div>

        <Formik
          enableReinitialize
          initialValues={{
            batch_number: selectedBatch?.batch_number || "",
            variant_id: selectedBatch?.variant_id || "",
            product_id: selectedBatch?.variant_id ? (products.flatMap((p: any) => p.variants || []).find((v: any) => v.id === selectedBatch.variant_id)?.product_id || "") : "",
            branch_id: selectedBatch?.branch_id || "",
            supplier_id: selectedBatch?.supplier_id || "",
            expiry_date: selectedBatch?.expiry_date ? format(new Date(selectedBatch.expiry_date), "yyyy-MM-dd") : "",
            production_date: selectedBatch?.production_date ? format(new Date(selectedBatch.production_date), "yyyy-MM-dd") : "",
            quantity: selectedBatch?.quantity || 0,
            unit: selectedBatch?.unit || "pcs",
          }}
          validate={validateWithZod(productBatchSchema)}
          onSubmit={async (values) => {
            await handleSubmit(values, selectedBatch, handleCloseModal);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
            <Form className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label required>Branch</Label>
                  <select
                    name="branch_id"
                    value={values.branch_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full h-11 rounded-xl border ${touched.branch_id && errors.branch_id ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-200'} bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                  >
                    <option value="">Select Branch...</option>
                    {branches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {touched.branch_id && errors.branch_id && (
                    <p className="text-xs text-rose-500 mt-1">{errors.branch_id as string}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Supplier</Label>
                  <select
                    name="supplier_id"
                    value={values.supplier_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label required>Product / Variant</Label>
                <select
                  name="variant_id"
                  value={values.variant_id}
                  onChange={(e) => {
                    const variantId = e.target.value;
                    const variant = products.flatMap((p: any) => p.variants || []).find((v: any) => v.id === variantId);
                    setFieldValue("variant_id", variantId);
                    setFieldValue("product_id", variant?.product_id || "");
                  }}
                  onBlur={handleBlur}
                  className={`w-full h-11 rounded-xl border ${touched.variant_id && errors.variant_id ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-200'} bg-white px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white`}
                >
                  <option value="">Select Product Variant...</option>
                  {products.map((p: any) => (
                    <optgroup key={p.id} label={p.name}>
                      {p.variants?.map((v: any) => (
                        <option key={v.id} value={v.id}>{p.name} - {v.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {touched.variant_id && errors.variant_id && (
                  <p className="text-xs text-rose-500 mt-1">{errors.variant_id as string}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label required>Lot Number / Batch ID</Label>
                <InputField
                  name="batch_number"
                  placeholder="e.g. LOT-2024-001"
                  value={values.batch_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!(touched.batch_number && errors.batch_number)}
                  hint={touched.batch_number && errors.batch_number ? String(errors.batch_number) : ""}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Production Date</Label>
                  <InputField
                    type="date"
                    name="production_date"
                    value={values.production_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Expiry Date</Label>
                  <InputField
                    type="date"
                    name="expiry_date"
                    value={values.expiry_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label required>Initial Quantity</Label>
                  <InputField
                    type="number"
                    name="quantity"
                    value={values.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!(touched.quantity && errors.quantity)}
                    hint={touched.quantity && errors.quantity ? String(errors.quantity) : ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label required>Unit</Label>
                  <InputField
                    name="unit"
                    placeholder="box, pcs, kg..."
                    value={values.unit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!(touched.unit && errors.unit)}
                    hint={touched.unit && errors.unit ? String(errors.unit) : ""}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <Button className="flex-1 dark:border-gray-700 dark:text-gray-300" variant="outline" onClick={handleCloseModal} disabled={isCreating || isUpdating}>
                  Cancel
                </Button>
                <Button className="flex-1" type="submit" loading={isCreating || isUpdating}>
                  {selectedBatch ? "Save Changes" : "Create Batch"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      <AlertDialog
        isOpen={isAlertOpen}
        onClose={closeDeleteAlert}
        onConfirm={handleConfirmDelete}
        title="Delete Batch?"
        description="Are you sure you want to delete this batch? This action cannot be undone and will affect your current stock level."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
