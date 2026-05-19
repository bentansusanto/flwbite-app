"use client";

import React, { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, Edit,
  Percent, Info
} from "lucide-react";
import { Form, Formik } from "formik";
import { useTaxHook } from "./hooks";
import { taxSchema } from "./schema";
import { validateWithZod } from "@/utils/formik-zod";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Switch from "@/components/form/switch/Switch";

export default function TaxesPage() {
  const [search, setSearch] = useState("");
  const {
    taxes,
    isFetching,
    isLoading,
    isDeleting,
    isModalOpen,
    selectedTax,
    isAlertOpen,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = useTaxHook();

  const filtered = useMemo(() => {
    return taxes.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [taxes, search]);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Taxes</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure and manage tax rates for your business.</p>
        </div>
        <Button onClick={() => handleOpenModal()} startIcon={<Plus size={18} />}>
          Add Tax
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tax rules..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-transparent bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/5 dark:border-white/5 dark:bg-gray-950 dark:text-white/90 dark:placeholder-gray-500"
        />
      </div>

      {/* Grid List or Loading / Empty States */}
      {isFetching ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
              <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800"></div>
              <div className="mt-4 h-5 w-2/3 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
              <div className="mt-2 h-4 w-full rounded-lg bg-gray-50 dark:bg-gray-800/50"></div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(tax => (
            <div key={tax.id} className="group relative rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-theme-xl dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                  <Percent size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(tax)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(tax.id)} className="p-1.5 text-gray-400 hover:text-error-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-800 dark:text-white/90">{tax.name}</h4>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    tax.is_active ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-850 dark:text-gray-400"
                  }`}>
                    {tax.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Rate</span>
                  <span className="mt-0.5 text-xl font-semibold text-brand-600 dark:text-brand-400">{tax.value}%</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-gray-800">
                  <Info size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 py-20 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
            <Percent size={32} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h4 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">No taxes found</h4>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating your first tax rate.</p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => handleOpenModal()}
          >
            Create Tax
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg">
        <div className="border-b border-gray-100 p-5 dark:border-gray-800">
          <h4 className="text-base font-bold text-gray-800 dark:text-white/90">{selectedTax ? "Edit Tax Rule" : "Create New Tax"}</h4>
          <p className="text-sm text-gray-400">Specify tax name and percentage rate.</p>
        </div>
        <Formik
          initialValues={{
            name: selectedTax?.name || "",
            value: (selectedTax?.value !== undefined ? selectedTax.value : "") as unknown as number,
            is_active: selectedTax?.is_active !== undefined ? selectedTax.is_active : true,
          }}
          validate={validateWithZod(taxSchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
            <Form className="p-5 space-y-4">
              <div>
                <Label required>Tax Name</Label>
                <InputField
                  name="name"
                  placeholder="e.g. VAT (PPN)"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!(touched.name && errors.name)}
                  hint={touched.name && errors.name ? (errors.name as string) : ""}
                />
              </div>
              <div>
                <Label required>Rate (%)</Label>
                <InputField
                  type="number"
                  name="value"
                  placeholder="0"
                  value={values.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!(touched.value && errors.value)}
                  hint={touched.value && errors.value ? (errors.value as string) : ""}
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <Switch
                  label={values.is_active ? "Status: Active" : "Status: Inactive"}
                  checked={values.is_active}
                  onChange={(checked) => setFieldValue("is_active", checked)}
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal} disabled={isLoading}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving..." : selectedTax ? "Update" : "Create"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Tax Rule?"
        description="This will remove the tax from all future transactions. Are you sure?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
