import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import ActiveSessionsWidget from "@/components/ecommerce/ActiveSessionsWidget";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | Flwbite - Next.js Dashboard Template",
  description: "This is Next.js Home for Flwbite Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-1 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
           {/* Optional action buttons can go here */}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Top Section: Full Width Metrics */}
      <div className="col-span-12">
        <EcommerceMetrics />
      </div>

      {/* Middle Section */}
      <div className="col-span-12 xl:col-span-8">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <MonthlyTarget />
      </div>

      {/* Bottom Section: Recent Orders (8) & Active Sessions (4) */}
      <div className="col-span-12 xl:col-span-8">
        <RecentOrders />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <ActiveSessionsWidget />
      </div>
    </div>
    </div>
  );
}
