"use client";

import React from "react";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Form, Formik } from "formik";
import { 
  Edit, 
  Folder, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Utensils, 
  Briefcase 
} from "lucide-react";
import { useCategoryHook } from "./hooks";
import { categorySchema } from "./schema";
import { validateWithZod } from "@/utils/formik-zod";
import { AlertDialog } from "@/components/ui/alert-dialog/AlertDialog";

export const CategoryPage = () => {
  const {
    categories,
    isFetching,
    isLoading,
    isDeleting,
    isModalOpen,
    selectedCategory,
    isAlertOpen,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = useCategoryHook();

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 dark:bg-[#06060a] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Categories
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Organize your products and services into meaningful groups.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          startIcon={<Plus size={18} />}
        >
          Add Category
        </Button>
      </div>

      {/* Grid Section */}
      {isFetching ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
              <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800"></div>
              <div className="mt-4 h-5 w-2/3 rounded-lg bg-gray-100 dark:bg-gray-800"></div>
              <div className="mt-2 h-4 w-full rounded-lg bg-gray-50 dark:bg-gray-800/50"></div>
            </div>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category: any) => (
            <div
              key={category.id}
              className="group relative rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-brand-100 hover:shadow-theme-xl dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md dark:hover:border-brand-500/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                  {category.category_type === "retail" ? (
                    <ShoppingBag size={24} />
                  ) : category.category_type === "f&b" ? (
                    <Utensils size={24} />
                  ) : category.category_type === "service" ? (
                    <Briefcase size={24} />
                  ) : (
                    <Folder size={24} />
                  )}
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1.5 text-gray-400 hover:text-error-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 dark:text-white/90">
                  {category.name}
                </h4>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                  {category.description || "No description provided."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 dark:border-gray-800">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Products
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {category.product_count || 0} Items
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 py-20 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
            <Folder size={32} className="text-gray-300 dark:text-gray-600" />
          </div>
          <h4 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">No categories found</h4>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating your first category.</p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => handleOpenModal()}
          >
            Create Category
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        className="max-w-[500px] p-6 sm:p-10"
      >
        <div className="flex flex-col gap-1">
          <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {selectedCategory ? "Edit Category" : "New Category"}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCategory ? "Update the details of your category." : "Add a new category to organize your items."}
          </p>
        </div>

        <Formik
          initialValues={{
            name: selectedCategory?.name || "",
            description: selectedCategory?.description || "",
            category_type: selectedCategory?.category_type || "retail",
          }}
          validate={validateWithZod(categorySchema)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
            <Form className="mt-8 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label required>Category Name</Label>
                  <InputField
                    name="name"
                    placeholder="e.g. Beverages, Main Course"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!(touched.name && errors.name)}
                    hint={touched.name && errors.name ? (errors.name as string) : ""}
                  />
                </div>

                <div>
                  <Label required>Business Type</Label>
                  <Select
                    options={[
                      { label: "Retail", value: "retail" },
                      { label: "F&B", value: "f&b" },
                      { label: "Service", value: "service" },
                    ]}
                    placeholder="Select business type"
                    defaultValue={values.category_type}
                    onChange={(val) => setFieldValue("category_type", val)}
                  />
                  {touched.category_type && errors.category_type && (
                    <p className="mt-1.5 text-xs text-error-500">{errors.category_type as string}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <TextArea
                  rows={3}
                  placeholder="Tell us more about this category..."
                  value={values.description}
                  onChange={(val) => setFieldValue("description", val)}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : selectedCategory ? "Update" : "Create"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori?"
        description="Tindakan ini tidak dapat dibatalkan. Kategori yang sudah dihapus tidak bisa dipulihkan kembali."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
