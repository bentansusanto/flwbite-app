"use client";
import React from "react";
import { Plus, ArrowLeft, PlusCircle, Trash2, ShoppingBag, Utensils, Briefcase, ChevronRight } from "lucide-react";
import { Form, Formik, FieldArray } from "formik";
import { useProductHook, ProductType } from "./hooks";
import { productSchema, type ProductVariantInput } from "./schema";
import { validateWithZod } from "@/utils/formik-zod";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";
import { Modal } from "@/components/ui/modal";
import { ProductTable } from "./ProductTable";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ImageUpload from "@/components/form/ImageUpload";

const PRODUCT_TYPES = [
  { type: "retail" as ProductType, label: "Ritel", description: "Produk fisik dijual per unit.", icon: <ShoppingBag size={28} />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "hover:border-blue-300" },
  { type: "f&b" as ProductType, label: "Makanan & Minuman", description: "Menu makanan dan minuman.", icon: <Utensils size={28} />, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", border: "hover:border-orange-300" },
  { type: "service" as ProductType, label: "Layanan", description: "Layanan atau jasa.", icon: <Briefcase size={28} />, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "hover:border-purple-300" },
];

const TYPE_BADGE: Record<string, string> = {
  retail: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  "f&b": "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  service: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
};

const buildDefaultValues = (type: ProductType) => ({
  name: "", description: "", category_id: "", type,
  is_stock_tracked: type === "retail", 
  is_sell: true,
  image: "",
  variants: [{ name: "Standar", price: 0, cost_price: null, is_active: true }],
});

export const ProductPage = () => {
  const {
    paginatedProducts, filteredProducts, allProducts, categories, selectedProduct, selectedType,
    searchQuery, filterType, sortField, sortOrder, currentPage, totalPages, pageSize, expandedProductId,
    handleSearch, handleFilterType, handleSort, handleToggleExpand, setCurrentPage, handlePageSizeChange,
    modalStep, handleOpenCreate, handleOpenEdit, handleSelectType, handleBackToTypeSelect, handleCloseModal, handleSubmit,
    isFetching, isLoading, isDeleting,
    isAlertOpen, handleDelete, handleConfirmDelete, handleCancelDelete,
  } = useProductHook();

  // Filter categories based on the selected product type
  const categoryOptions = categories
    .filter((c: any) => c.category_type === selectedType)
    .map((c: any) => ({ label: c.name, value: c.id }));

  const initialValues = selectedProduct
    ? {
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        category_id: selectedProduct.category_id || "",
        type: selectedProduct.type || "retail",
        is_stock_tracked: selectedProduct.is_stock_tracked ?? true,
        is_sell: selectedProduct.is_sell ?? true,
        image: selectedProduct.image || "",
        variants:
          selectedProduct.variants?.length > 0
            ? selectedProduct.variants.map((v: any) => ({
                id: v.id,
                name: v.name,
                price: v.price,
                cost_price: v.cost_price ?? null,
                is_active: v.is_active,
              }))
            : [{ name: "Standar", price: 0, cost_price: null, is_active: true }],
      }
    : buildDefaultValues(selectedType);

  return (
    <div className="p-3 sm:p-4 space-y-5 bg-transparent min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Produk</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Kelola semua produk dan variannya.</p>
        </div>
        <Button onClick={handleOpenCreate} startIcon={<Plus size={16} />}>Tambah Produk</Button>
      </div>

      {/* Table */}
      <ProductTable
        products={paginatedProducts}
        filteredCount={filteredProducts.length}
        totalCount={allProducts.length}
        isFetching={isFetching}
        searchQuery={searchQuery}
        filterType={filterType}
        sortField={sortField}
        sortOrder={sortOrder}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        expandedProductId={expandedProductId}
        onSearch={handleSearch}
        onFilterType={handleFilterType}
        onSort={handleSort}
        onToggleExpand={handleToggleExpand}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onOpenCreate={handleOpenCreate}
      />

      {/* Step 1: Type Selector */}
      <Modal isOpen={modalStep === "type-select"} onClose={handleCloseModal} className="max-w-[480px] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">Pilih Tipe Produk</h4>
          <p className="mt-1 text-sm text-gray-500">Tentukan kategori bisnis produk yang akan dibuat.</p>
        </div>
        <div className="flex flex-col gap-3">
          {PRODUCT_TYPES.map(({ type, label, description, icon, color, bg, border }) => (
            <button key={type} onClick={() => handleSelectType(type)} className={`flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left transition-all dark:border-gray-800 dark:bg-white/[0.03] ${border}`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>{icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-white/90">{label}</p>
                <p className="mt-0.5 text-sm text-gray-500">{description}</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-gray-300" />
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={modalStep === "form"} onClose={handleCloseModal} className="max-w-[620px]" isScrollable={false}>
        <Formik initialValues={initialValues} validate={validateWithZod(productSchema)} onSubmit={handleSubmit} enableReinitialize>
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
            <Form className="flex flex-col max-h-[90vh]">
              {/* Sticky Header: Title Only */}
              <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#06060a] z-10 shrink-0">
                <div className="flex items-start gap-3">
                  {!selectedProduct && (
                    <button type="button" onClick={handleBackToTypeSelect} className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 transition-colors">
                      <ArrowLeft size={15} />
                    </button>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">{selectedProduct ? "Edit Produk" : "Produk Baru"}</h4>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TYPE_BADGE[selectedType]}`}>{selectedType}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{selectedProduct ? "Perbarui detail produk." : "Isi informasi dan tambahkan minimal satu varian."}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable Middle: Product Info & Variants */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-6 no-scrollbar space-y-8">
                {/* Product Info Section */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <ImageUpload 
                      value={values.image} 
                      onChange={(url) => setFieldValue("image", url)} 
                      label="Foto Produk" 
                      className="shrink-0"
                    />
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label required>Nama Produk</Label>
                          <InputField name="name" placeholder="cth. Kopi Susu" value={values.name} onChange={handleChange} onBlur={handleBlur} error={!!(touched.name && errors.name)} hint={touched.name && errors.name ? String(errors.name) : ""} />
                        </div>
                        <div>
                          <Label required>Kategori</Label>
                          <Select options={categoryOptions} placeholder="Pilih kategori" defaultValue={values.category_id} onChange={(val) => setFieldValue("category_id", val)} />
                          {touched.category_id && errors.category_id && <p className="mt-1 text-xs text-error-500">{String(errors.category_id)}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {values.type !== "service" && (
                          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${values.is_stock_tracked ? "border-brand-200 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-500/5" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.03]"}`}>
                            <div className="relative shrink-0 mt-0.5">
                              <input type="checkbox" className="sr-only" checked={values.is_stock_tracked} onChange={(e) => setFieldValue("is_stock_tracked", e.target.checked)} />
                              <div className={`h-5 w-9 rounded-full transition-colors ${values.is_stock_tracked ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${values.is_stock_tracked ? "translate-x-4" : "translate-x-0.5"}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Lacak Stok?</p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {values.is_stock_tracked ? "Stok dipantau saat transaksi." : "Stok tidak dipantau."}
                              </p>
                            </div>
                          </label>
                        )}

                        {values.type === "retail" && (
                          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${values.is_sell ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-500/5" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.03]"}`}>
                            <div className="relative shrink-0 mt-0.5">
                              <input type="checkbox" className="sr-only" checked={values.is_sell} onChange={(e) => setFieldValue("is_sell", e.target.checked)} />
                              <div className={`h-5 w-9 rounded-full transition-colors ${values.is_sell ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${values.is_sell ? "translate-x-4" : "translate-x-0.5"}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Produk Dijual?</p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {values.is_sell ? "Bisa dibeli pelanggan." : "Hanya untuk stok internal."}
                              </p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Deskripsi (Opsional)</Label>
                    <textarea name="description" rows={1} className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90" placeholder="Deskripsi singkat produk..." value={values.description} onChange={handleChange} onBlur={handleBlur} />
                  </div>
                </div>

                {/* Variants Section */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                  <Label required>Varian Produk</Label>
                  {touched.variants && typeof errors.variants === "string" && <p className="text-xs text-error-500">{errors.variants}</p>}
                </div>
                <FieldArray name="variants">
                  {({ remove, push }) => (
                    <div className="space-y-3">
                      {values.variants.map((variant: ProductVariantInput, index: number) => (
                        <div key={index} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02] space-y-3">
                          <div className="flex items-start gap-2.5">
                            <div className="flex-1">
                              <InputField name={`variants.${index}.name`} placeholder="Nama varian (cth. Kecil)" value={variant.name} onChange={handleChange} onBlur={handleBlur} error={!!((touched.variants as any)?.[index]?.name && (errors.variants as any)?.[index]?.name)} hint={(touched.variants as any)?.[index]?.name && (errors.variants as any)?.[index]?.name ? (errors.variants as any)[index].name : ""} />
                            </div>
                            <button type="button" onClick={() => setFieldValue(`variants.${index}.is_active`, !variant.is_active)} className={`mt-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${variant.is_active ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                              {variant.is_active ? "Aktif" : "Nonaktif"}
                            </button>
                            {values.variants.length > 1 && (
                              <button type="button" onClick={() => remove(index)} className="mt-1 p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            )}
                          </div>
                          <div className={`grid gap-3 ${values.type === "retail" ? "grid-cols-2" : "grid-cols-1"}`}>
                            {values.is_sell && (
                              <div>
                                <p className="mb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Harga Jual</p>
                                <div className={`flex h-11 overflow-hidden rounded-xl border shadow-sm transition focus-within:ring-2 ${(touched.variants as any)?.[index]?.price && (errors.variants as any)?.[index]?.price ? "border-red-500 focus-within:ring-red-500/10" : "border-gray-200 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-brand-500/10"}`}>
                                  <span className="flex items-center border-r border-gray-100 bg-gray-50 px-3 text-xs font-bold text-gray-400 dark:border-gray-700 dark:bg-gray-800">Rp</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    id={`variants.${index}.price`}
                                    name={`variants.${index}.price`}
                                    placeholder="0"
                                    value={variant.price === 0 ? "" : variant.price}
                                    onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setFieldValue(`variants.${index}.price`, raw === "" ? "" : Number(raw)); }}
                                    onBlur={handleBlur}
                                    className="flex-1 bg-transparent px-3 text-sm font-bold text-gray-800 outline-none dark:text-white/90"
                                  />
                                </div>
                              </div>
                            )}
                            {values.type === "retail" && (
                              <div>
                                <p className="mb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Harga Modal</p>
                                <div className="flex h-11 overflow-hidden rounded-xl border border-gray-200 shadow-sm transition focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-500/10 dark:border-gray-700">
                                  <span className="flex items-center border-r border-gray-100 bg-gray-50 px-3 text-xs font-bold text-gray-400 dark:border-gray-700 dark:bg-gray-800">Rp</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    id={`variants.${index}.cost_price`}
                                    name={`variants.${index}.cost_price`}
                                    placeholder="0 (opsional)"
                                    value={!variant.cost_price ? "" : variant.cost_price}
                                    onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setFieldValue(`variants.${index}.cost_price`, raw === "" ? null : Number(raw)); }}
                                    onBlur={handleBlur}
                                    className="flex-1 bg-transparent px-3 text-sm font-bold text-gray-800 outline-none dark:text-white/90"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => push({ name: "", price: 0, cost_price: null, is_active: true })} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-3 text-sm font-bold text-gray-500 hover:border-brand-300 hover:text-brand-500 dark:border-gray-700 transition-all hover:bg-brand-50/50">
                        <PlusCircle size={16} />Tambah Varian Baru
                      </button>
                    </div>
                  )}
                </FieldArray>
                </div>
              </div>

              {/* Sticky Footer: Actions */}
              <div className="p-6 sm:p-8 pt-4 flex gap-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#06060a] z-10 shrink-0">
                <Button type="button" className="flex-1 h-12 font-bold" variant="outline" onClick={handleCloseModal} disabled={isLoading}>Batal</Button>
                <Button className="flex-1 h-12 font-bold" type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : selectedProduct ? "Simpan Perubahan" : "Buat Produk"}</Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      <AlertDialog isOpen={isAlertOpen} onClose={handleCancelDelete} onConfirm={handleConfirmDelete} title="Hapus Produk?" description="Tindakan ini tidak dapat dibatalkan. Semua varian juga akan terhapus." confirmLabel="Hapus" cancelLabel="Batal" variant="danger" isLoading={isDeleting} />
    </div>
  );
};
