import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | Flwbite - Next.js Dashboard Template",
  description: "This is Next.js Home for Flwbite Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Top Section: Full Width Metrics */}
      <div className="col-span-12">
        <EcommerceMetrics />
      </div>

      {/* Middle Section: Statistics Chart */}
      <div className="col-span-12">
        <StatisticsChart />
      </div>

      {/* Bottom Section: Recent Orders (8) & Monthly Target (4) */}
      <div className="col-span-12 xl:col-span-8">
        <RecentOrders />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <MonthlyTarget />
      </div>
    </div>
  );
}
