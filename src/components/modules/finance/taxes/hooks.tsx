"use client";

import { useState } from "react";
import { TaxInput } from "./schema";
import {
  useGetTaxesQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useDeleteTaxMutation,
  Tax
} from "@/store/api/taxApi";
import { toast } from "sonner";

export const useTaxHook = () => {
  const { data: taxesData, isLoading: isFetching } = useGetTaxesQuery(undefined);
  const [createTax, { isLoading: isCreating }] = useCreateTaxMutation();
  const [updateTax, { isLoading: isUpdating }] = useUpdateTaxMutation();
  const [deleteTax, { isLoading: isDeleting }] = useDeleteTaxMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);

  // Alert dialog state
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState<string | null>(null);

  const taxes = taxesData?.data || [];

  const handleOpenModal = (tax: Tax | null = null) => {
    setSelectedTax(tax);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTax(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: TaxInput) => {
    try {
      if (selectedTax) {
        await updateTax({ id: selectedTax.id, ...values }).unwrap();
        toast.success("Pajak berhasil diperbarui");
      } else {
        await createTax(values).unwrap();
        toast.success("Pajak berhasil dibuat");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = (id: string) => {
    setTaxToDelete(id);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taxToDelete) return;
    try {
      await deleteTax(taxToDelete).unwrap();
      toast.success("Pajak berhasil dihapus");
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal menghapus pajak");
    } finally {
      setIsAlertOpen(false);
      setTaxToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsAlertOpen(false);
    setTaxToDelete(null);
  };

  return {
    taxes,
    isFetching,
    isLoading: isCreating || isUpdating,
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
  };
};
