"use client";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { MoreDotIcon } from "@/icons";
import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

import { useGetSalesReportQuery } from "@/store/api/reportApi";
import { formatCurrency } from "../../utils/format";

export default function MonthlyTarget() {
  const { data: monthlyData, isLoading: isMonthlyLoading } = useGetSalesReportQuery({ period: "monthly" });
  const { data: dailyData, isLoading: isDailyLoading } = useGetSalesReportQuery({ period: "daily" });

  const targetAmount = 50000000; // Target 50jt
  const monthlyRevenue = monthlyData?.data?.total_sales || 0;
  const dailyRevenue = dailyData?.data?.total_sales || 0;
  const progress = Math.min(100, (monthlyRevenue / targetAmount) * 100);

  const series = [Number(progress.toFixed(2))];
  const options: ApexOptions = {
    colors: ["#0f766e"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#6b7280",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#0f766e"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  if (isMonthlyLoading || isDailyLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md sm:p-6 animate-pulse h-full">
        <div className="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded mb-4" />
        <div className="h-[250px] w-full bg-gray-50 dark:bg-gray-800/50 rounded-full mb-8" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white shadow-theme-sm dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md h-full overflow-hidden">
      <div className="px-5 pt-5 bg-white rounded-t-3xl pb-11 dark:bg-transparent sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              Target you’ve set for each month
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                tag="a"
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                tag="a"
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="relative ">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium ${
            progress >= 100 ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500" : "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500"
          }`}>
            {progress >= 100 ? "Achieved" : `${progress.toFixed(0)}% Achieved`}
          </span>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          You earn {formatCurrency(dailyRevenue)} today. Keep up your
          good work!
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Target
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {targetAmount >= 1000000 ? `${(targetAmount/1000000).toFixed(0)}M` : formatCurrency(targetAmount)}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Revenue
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {monthlyRevenue >= 1000000 ? `${(monthlyRevenue/1000000).toFixed(1)}M` : formatCurrency(monthlyRevenue)}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Today
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {dailyRevenue >= 1000 ? `${(dailyRevenue/1000).toFixed(0)}K` : formatCurrency(dailyRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
}
