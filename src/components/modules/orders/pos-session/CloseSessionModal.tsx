import React, { useState } from "react";
import { useGetActiveSessionSummaryQuery, useCloseSessionMutation } from "@/store/api/posSessionApi";
import Cookies from "js-cookie";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { X, Receipt, Wallet, Banknote, Power } from "lucide-react";
import { useFormik } from "formik";
import { z } from "zod";
import { validateWithZod } from "@/utils/formik-zod";

const closeSessionSchema = z.object({
  closing_balance: z.coerce.number().min(0, "Saldo tidak boleh negatif"),
  notes: z.string().min(1, "Catatan wajib diisi"),
});

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloseSessionModal: React.FC<CloseSessionModalProps> = ({ isOpen, onClose }) => {
  const branchId = Cookies.get("flwbite_branch");

  const { data: sessionData, isLoading } = useGetActiveSessionSummaryQuery(branchId || "", {
    skip: !branchId || !isOpen,
  });

  const [closeSession, { isLoading: isClosing }] = useCloseSessionMutation();
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      closing_balance: "" as string | number, // start empty to force input
      notes: "",
    },
    validate: validateWithZod(closeSessionSchema) as any,
    onSubmit: async (values) => {
      if (!branchId) {
        setError("Cabang tidak ditemukan.");
        return;
      }
      try {
        await closeSession({
          branch_id: branchId,
          closing_balance: Number(values.closing_balance) || 0,
          notes: values.notes,
        }).unwrap();
        
        window.location.reload();
      } catch (err: any) {
        setError(err?.data?.message || "Gagal menutup sesi.");
      }
    },
  });

  const summary = sessionData?.data?.summary;
  const expectedCash = summary?.expected_cash || 0;
  const currentInputBalance = formik.values.closing_balance !== "" ? Number(formik.values.closing_balance) : 0;
  const diff = currentInputBalance - (sessionData?.data?.opening_balance || 0) - expectedCash;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tutup Sesi Kasir</h2>
            <p className="text-sm text-gray-500">Hitung uang di laci dan rekap penjualan.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">Memuat rekap...</div>
          ) : (
            <div className="space-y-6">

              {/* Sales Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                    <Receipt className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Total Penjualan</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rp {summary?.total_amount?.toLocaleString() || 0}
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-500">
                    <Banknote className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Total Cash</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    Rp {summary?.expected_cash?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {/* Payment Methods Detail */}
              {summary?.payment_methods && Object.keys(summary.payment_methods).length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    Metode Pembayaran
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(summary.payment_methods).map(([method, amount]) => (
                      <div key={method} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{method}</span>
                        <span className="font-medium text-gray-900 dark:text-white">Rp {amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <form id="close-session-form" onSubmit={formik.handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Saldo Awal
                    </label>
                    <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 font-medium cursor-not-allowed">
                      Rp {sessionData?.data?.opening_balance?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Uang Fisik Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="closing_balance"
                      placeholder="Hitung uang laci..."
                      value={formik.values.closing_balance}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={!!(formik.touched.closing_balance && formik.errors.closing_balance)}
                      hint={formik.touched.closing_balance && formik.errors.closing_balance ? String(formik.errors.closing_balance) : undefined}
                      className="w-full"
                    />
                  </div>
                </div>

                {formik.values.closing_balance !== "" && (
                  <div className={`p-4 rounded-xl border flex justify-between items-center ${
                    diff === 0
                      ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                      : diff > 0
                        ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                  }`}>
                    <span className="text-sm font-semibold">Selisih Uang (Difference):</span>
                    <span className="font-bold">
                      {diff > 0 ? '+' : ''}Rp {diff.toLocaleString()}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catatan Penutupan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="notes"
                    placeholder="Tulis jika ada selisih uang atau catatan shift..."
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm outline-none resize-none h-20"
                  />
                  {formik.touched.notes && formik.errors.notes && (
                    <p className="mt-1 text-xs text-red-500">{String(formik.errors.notes)}</p>
                  )}
                </div>
              </form>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">Batal</Button>
          <Button
            onClick={() => formik.handleSubmit()}
            disabled={isClosing || isLoading}
            className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 flex items-center gap-2"
          >
            <Power className="w-4 h-4" />
            {isClosing ? "Menutup..." : "Konfirmasi & Tutup Sesi"}
          </Button>
        </div>

      </div>
    </div>
  );
};
