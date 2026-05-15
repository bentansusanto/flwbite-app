"use client";

import { useState } from "react";
import { CategoryInput } from "./schema";
import { 
  useGetCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation 
} from "@/store/api/categoryApi";
import { toast } from "sonner";

export const useCategoryHook = () => {
  const { data: categoriesData, isLoading: isFetching } = useGetCategoriesQuery(undefined);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Alert dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const categories = categoriesData?.data || [];

  const handleOpenModal = (category: any = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: CategoryInput) => {
    try {
      if (selectedCategory) {
        await updateCategory({ id: selectedCategory.id, ...values }).unwrap();
        toast.success("Kategori berhasil diperbarui");
      } else {
        await createCategory(values).unwrap();
        toast.success("Kategori berhasil dibuat");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.data?.message || "Terjadi kesalahan");
    }
  };

  // Opens the AlertDialog instead of browser confirm()
  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete).unwrap();
      toast.success("Kategori berhasil dihapus");
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menghapus kategori");
    } finally {
      setIsAlertOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsAlertOpen(false);
    setCategoryToDelete(null);
  };

  return {
    categories,
    isFetching,
    isLoading: isCreating || isUpdating,
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
  };
};
