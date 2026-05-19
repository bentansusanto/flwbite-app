"use client";

import { useState } from "react";
import { PromotionSchemaInput } from "./schema";
import {
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  Promotion,
  PromotionRule
} from "@/store/api/promotionApi";
import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetCategoriesQuery } from "@/store/api/categoryApi";
import { toast } from "sonner";

export const usePromotionHook = () => {
  const { data: promotionsData, isLoading: isFetching } = useGetPromotionsQuery(undefined);
  const { data: branchesData } = useGetBranchesQuery({});
  const { data: productsData } = useGetProductsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({});

  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // Alert dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);

  const promotions = promotionsData?.data || [];
  const branches = branchesData?.data || [];
  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const handleOpenModal = (promo: Promotion | null = null) => {
    setSelectedPromotion(promo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPromotion(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: PromotionSchemaInput) => {
    try {
      // Map form rules to match raw JSON format for condition_value / action_value if necessary
      const formattedRules = values.rules.map((rule) => ({
        condition_type: rule.condition_type,
        condition_value: JSON.stringify(rule.condition_value),
        action_type: rule.action_type,
        action_value: JSON.stringify(rule.action_value),
        condition_variants: rule.condition_variants || [],
        condition_categories: rule.condition_categories || [],
        action_variants: rule.action_variants || [],
        action_categories: rule.action_categories || [],
      }));

      const payload = {
        name: values.name,
        description: values.description || "",
        status: values.status,
        is_stackable: values.is_stackable,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        branches: values.branches,
        rules: formattedRules as any[],
      };

      if (selectedPromotion) {
        await updatePromotion({ id: selectedPromotion.id, body: payload }).unwrap();
        toast.success("Promosi berhasil diperbarui");
      } else {
        await createPromotion(payload).unwrap();
        toast.success("Promosi berhasil dibuat");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = (id: string) => {
    setPromotionToDelete(id);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!promotionToDelete) return;
    try {
      await deletePromotion(promotionToDelete).unwrap();
      toast.success("Promosi berhasil dihapus");
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menghapus promosi");
    } finally {
      setIsAlertOpen(false);
      setPromotionToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsAlertOpen(false);
    setPromotionToDelete(null);
  };

  return {
    promotions,
    branches,
    products,
    categories,
    isFetching,
    isLoading: isCreating || isUpdating,
    isDeleting,
    isModalOpen,
    selectedPromotion,
    isAlertOpen,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
  };
};
