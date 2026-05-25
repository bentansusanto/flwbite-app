"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, BoxIconLine, GroupIcon, DollarLineIcon, ShootingStarIcon } from "@/icons";
import { useGetDashboardStatsQuery } from "@/store/api/reportApi";
import { formatCurrency } from "../../utils/format";

export const EcommerceMetrics = () => {
  const { data: statsData, isLoading } = useGetDashboardStatsQuery();
  const stats = statsData?.data;

  const avgOrder = stats && stats.total_orders > 0 
    ? stats.total_sales / stats.total_orders 
    : 0;

  const metrics = [
    {
      label: "Revenue",
      value: formatCurrency(stats?.total_sales || 0),
      icon: <DollarLineIcon className="size-6 text-brand-600 dark:text-brand-400" />,
      trend: "+12.5%",
      isUp: true
    },
    {
      label: "Orders",
      value: (stats?.total_orders || 0).toLocaleString(),
      icon: <BoxIconLine className="size-6 text-brand-600 dark:text-brand-400" />,
      trend: "+8.2%",
      isUp: true
    },
    {
      label: "Customers",
      value: (stats?.total_customers || 0).toLocaleString(),
      icon: <GroupIcon className="size-6 text-brand-600 dark:text-brand-400" />,
      trend: "+11.0%",
      isUp: true
    },
    {
      label: "Avg. Order",
      value: formatCurrency(avgOrder),
      icon: <ShootingStarIcon className="size-6 text-brand-600 dark:text-brand-400" />,
      trend: "+5.4%",
      isUp: true
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white dark:bg-gray-900/40 animate-pulse border border-gray-200 dark:border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-theme-sm hover:shadow-theme-md transition-all duration-300 hover:-translate-y-0.5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl dark:bg-brand-500/10">
            {metric.icon}
          </div>

          <div className="mt-5">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {metric.label}
            </span>
            <div className="flex items-center justify-between gap-2 mt-2">
              <h4 className="font-bold text-gray-800 text-lg sm:text-xl dark:text-white/90 truncate">
                {metric.value}
              </h4>
              <Badge color={metric.isUp ? "success" : "error"} className="shrink-0">
                {metric.isUp ? <ArrowUpIcon /> : <ArrowUpIcon className="rotate-180" />}
                {metric.trend}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
