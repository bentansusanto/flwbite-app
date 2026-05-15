import React, { useState, useEffect } from "react";
import { useGetActiveSessionSummaryQuery, useOpenSessionMutation, useGetMyActiveSessionsQuery } from "@/store/api/posSessionApi";
import Cookies from "js-cookie";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { useFormik } from "formik";
import { z } from "zod";
import { validateWithZod } from "@/utils/formik-zod";
import { useLogoutMutation } from "@/store/api/authApi";
import { useRouter } from "next/navigation";
import { LogOut, Building2 } from "lucide-react";
import { useGetBranchesQuery } from "@/store/api/branchApi";

const openSessionSchema = z.object({
  branch_id: z.string().optional(), // For owners/admins
  opening_balance: z.coerce.number().min(0, "Saldo tidak boleh negatif"),
  notes: z.string().min(1, "Catatan wajib diisi"),
});

export const PosSessionGuard = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [branchId, setBranchId] = useState(Cookies.get("flwbite_branch"));
  const role = Cookies.get("flwbite_role");
  const isOwnerOrAdmin = role === "owner" || role === "admin" || role === "super_admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  const [openSession, { isLoading: isOpening }] = useOpenSessionMutation();
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      branch_id: branchId || "",
      opening_balance: "" as string | number,
      notes: "",
    },
    validate: validateWithZod(openSessionSchema) as any,
    onSubmit: async (values) => {
      const selectedBranchId = isOwnerOrAdmin ? values.branch_id : branchId;

      if (!selectedBranchId) {
        setError("Cabang tidak ditemukan. Silakan pilih cabang.");
        return;
      }
      try {
        await openSession({
          branch_id: selectedBranchId,
          opening_balance: Number(values.opening_balance) || 0,
          notes: values.notes,
        }).unwrap();

        // Save branch ID to cookies for Owners/Admins
        if (isOwnerOrAdmin) {
          Cookies.set("flwbite_branch", selectedBranchId);
          setBranchId(selectedBranchId);
        }

        refetch();
      } catch (err: any) {
        setError(err?.data?.message || "Gagal membuka sesi.");
      }
    },
  });

  // Sync branchId from cookies or form selection
  useEffect(() => {
    if (isOwnerOrAdmin && formik.values.branch_id) {
      setBranchId(formik.values.branch_id);
    }
  }, [formik.values.branch_id, isOwnerOrAdmin]);

  const { data: mySessions, isLoading: isLoadingMySessions } = useGetMyActiveSessionsQuery(undefined, {
    skip: !mounted,
  });

  const activeSession = mySessions?.data?.[0];

  // Auto-detect branch from active sessions
  useEffect(() => {
    if (activeSession) {
      // If we don't have a branchId or it's different from the active session
      if (branchId !== activeSession.branch_id) {
        Cookies.set("flwbite_branch", activeSession.branch_id);
        setBranchId(activeSession.branch_id);
        formik.setFieldValue("branch_id", activeSession.branch_id);
      }
    }
  }, [activeSession, branchId, formik]);

  const { data: sessionData, isLoading: isLoadingSummary, refetch } = useGetActiveSessionSummaryQuery(branchId || "", {
    skip: !branchId,
  });

  const { data: branchesData } = useGetBranchesQuery({}, { skip: !isOwnerOrAdmin });
  const branches = branchesData?.data || [];

  const handleExit = async () => {
    if (isOwnerOrAdmin) {
      // Owner can just go back to dashboard
      router.push("/");
    } else {
      // Cashier must logout to exit the guard
      try {
        await logout(undefined).unwrap();
      } catch (err) {
        // Logout failed
      } finally {
        Cookies.remove("flwbite_token");
        Cookies.remove("flwbite_role");
        Cookies.remove("flwbite_branch");
        router.push("/login");
      }
    }
  };


  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="h-full w-full" />;
  }

  // If not a recognized role, no guard needed
  if (!role || (!isOwnerOrAdmin && role !== "cashier")) {
    return <>{children}</>;
  }

  // Still loading or checking session
  if (isLoadingMySessions || isLoadingSummary) {
    return <div className="flex items-center justify-center h-full">Memeriksa Sesi POS...</div>;
  }

  // If session is active, render the page
  if (sessionData?.data) {
    return <>{children}</>;
  }

  // Force Open Session Modal
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Buka Sesi Kasir</h2>
          <p className="text-gray-500 text-sm">Anda harus membuka sesi sebelum dapat memproses pesanan.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {isOwnerOrAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pilih Cabang (Owner/Admin)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="branch_id"
                  value={formik.values.branch_id}
                  onChange={formik.handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm outline-none appearance-none"
                >
                  <option value="">Pilih Cabang...</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              {formik.touched.branch_id && formik.errors.branch_id && (
                <p className="mt-1 text-xs text-red-500">{String(formik.errors.branch_id)}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Saldo Awal (Uang Laci)
            </label>
            <Input
              type="number"
              name="opening_balance"
              placeholder="0"
              value={formik.values.opening_balance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.opening_balance && formik.errors.opening_balance)}
              hint={formik.touched.opening_balance && formik.errors.opening_balance ? String(formik.errors.opening_balance) : undefined}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catatan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="notes"
              placeholder="Shift Pagi Budi..."
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm outline-none resize-none h-24"
            />
            {formik.touched.notes && formik.errors.notes && (
              <p className="mt-1 text-xs text-red-500">{String(formik.errors.notes)}</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleExit}
              className="flex-1 py-3 border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              {isOwnerOrAdmin ? "Batal" : "Keluar"}
            </Button>
            <Button
              type="submit"
              disabled={isOpening}
              className="flex-[2] py-3 text-base font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl hover:scale-[1.02] transition-transform"
            >
              {isOpening ? "Membuka Sesi..." : "Buka Sesi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
