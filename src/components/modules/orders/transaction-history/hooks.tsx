import { useFormik } from "formik";
import { transactionFilterSchema, TransactionFilterValues } from "./schema";
import { validateWithZod } from "@/utils/formik-zod";
import { useGetMeTenantQuery } from "@/store/api/tenantApi";
import { useState } from 'react';
import { printReceiptBluetooth } from '@/utils/bluetoothPrinter';
import { ReceiptData } from '@/components/modules/orders/new-orders/ReceiptModal';
import { toast } from 'sonner';

export const useTransactionFilters = (onFilter: (values: TransactionFilterValues) => void) => {
  const formik = useFormik<TransactionFilterValues>({
    initialValues: {
      start_date: "",
      end_date: "",
      status: "",
      payment_method: "",
      branch_id: "",
      search: "",
    },
    validate: validateWithZod(transactionFilterSchema),
    onSubmit: (values) => {
      onFilter(values);
    },
  });

  return formik;
};

export const useTransactionActions = () => {
  const { data: tenantRes } = useGetMeTenantQuery(undefined);
  const tenantName = tenantRes?.data?.name || "Toko Demo";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const [isPrintingBt, setIsPrintingBt] = useState(false);

  const handlePrintReceipt = async (trx: any) => {
    if (!trx) return;
    setIsPrintingBt(true);
    
    try {
      const receiptData: ReceiptData = {
        orderId: trx.order_number,
        cashierName: "Admin", // Or get from session if available
        branchName: trx.branch || "Cabang Utama",
        customerName: trx.customer_name || "",
        items: trx.items.map((item: any) => ({
          name: item.variant_name || "Item",
          quantity: item.qty,
          price: item.price
        })),
        subtotal: trx.total_amount,
        tax: trx.tax_amount,
        discount: trx.discount_amount,
        total: trx.final_amount,
        paymentMethod: trx.payment_method || "CASH",
        amountPaid: trx.final_amount, // Assume paid in full for history
        change: 0,
        date: new Date(trx.created_at),
        tenantName: "FLWBite POS" // Could be dynamically passed or taken from state if needed
      };

      await printReceiptBluetooth(receiptData);
      toast.success("Berhasil mencetak via Bluetooth");
    } catch (error: any) {
      toast.error("Gagal mencetak: " + (error.message || "Pastikan Bluetooth aktif"));
    } finally {
      setIsPrintingBt(false);
    }
  };

  return { handlePrintReceipt, isPrintingBt };
};
