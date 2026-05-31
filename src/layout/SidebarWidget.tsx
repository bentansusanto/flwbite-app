import React, { useMemo } from "react";
import { useGetCurrentSubscriptionQuery, useGetPlanByIdQuery } from "@/store/api/subscriptionApi";

export default function SidebarWidget() {
  const { data: subRes, isLoading: isLoadingSub } = useGetCurrentSubscriptionQuery(undefined);
  const subscription = subRes?.data;
  
  const { data: planRes } = useGetPlanByIdQuery(subscription?.plan_id || "", {
    skip: !subscription?.plan_id,
  });
  const plan = planRes?.data;

  const daysRemaining = useMemo(() => {
    if (!subscription?.end_date) return null;
    const end = new Date(subscription.end_date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [subscription?.end_date]);

  if (isLoadingSub || !subscription || !plan) return null;

  let title = `${plan.name} Plan`;
  let desc = `Aktif sampai ${new Date(subscription.end_date).toLocaleDateString()}`;
  let bodyText = `Akses ke ${plan.max_branches} cabang & ${plan.max_users} pengguna. Kelola bisnis tanpa hambatan.`;
  let isWarning = false;
  let isDanger = false;

  if (daysRemaining !== null) {
    if (daysRemaining <= 3 && daysRemaining >= 0) {
      title = "Langganan Segera Habis!";
      desc = `Tersisa ${daysRemaining} hari lagi.`;
      bodyText = "Akses POS Anda akan segera dibekukan. Segera perpanjang agar operasional tidak terhenti.";
      isDanger = true;
    } else if (daysRemaining <= 7 && daysRemaining > 3) {
      title = "Perpanjang Langganan";
      desc = `Tersisa ${daysRemaining} hari lagi.`;
      bodyText = "Jangan sampai transaksi terganggu. Siapkan perpanjangan paket Anda dari sekarang.";
      isWarning = true;
    } else if (daysRemaining < 0) {
      title = "Langganan Berakhir";
      desc = "Paket Anda telah kedaluwarsa.";
      bodyText = "Semua fitur POS telah dibekukan. Mohon lakukan pembayaran segera untuk memulihkan akses.";
      isDanger = true;
    }
  }

  return (
    <div
      className={`mx-4 mt-auto mb-4 w-auto rounded-2xl px-4 py-5 text-center
        ${isDanger ? "bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20" : isWarning ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20" : "bg-brand-50 dark:bg-white/[0.03] border border-brand-100 dark:border-white/5"}
      `}
    >
      <h3 className={`mb-2 font-semibold ${isDanger ? "text-red-700 dark:text-red-400" : isWarning ? "text-orange-700 dark:text-orange-400" : "text-brand-900 dark:text-white"}`}>
        {title}
      </h3>
      <p className={`mb-3 text-xs opacity-90 leading-relaxed ${isDanger ? "text-red-800 dark:text-red-200" : isWarning ? "text-orange-800 dark:text-orange-200" : "text-brand-800 dark:text-gray-300"}`}>
        {bodyText}
      </p>
      <div className={`mt-3 border-t pt-3 text-[11px] font-bold ${isDanger ? "border-red-200 text-red-600 dark:border-red-500/30 dark:text-red-400" : isWarning ? "border-orange-200 text-orange-600 dark:border-orange-500/30 dark:text-orange-400" : "border-brand-200 text-brand-700 dark:border-white/10 dark:text-brand-400"}`}>
        {desc}
      </div>
    </div>
  );
}
