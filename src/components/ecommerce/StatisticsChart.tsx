"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { format } from "date-fns";
import { useGetSalesChartQuery } from "@/store/api/reportApi";

export default function StatisticsChart() {
  const { data: chartData, isLoading: isChartLoading } = useGetSalesChartQuery({ period: "monthly" });
  
  const points = chartData?.data?.points || [];
  const categories = points.map(p => format(new Date(p.label), "dd MMM"));
  const salesData = points.map(p => p.sales);
  const revenueData = points.map(p => p.revenue);


  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
      categories: categories.length > 0 ? categories : ["No Data"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val) => {
          if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
          if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
          return val.toString();
        }
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Total Orders",
      data: salesData,
    },
    {
      name: "Revenue",
      data: revenueData,
    },
  ];

  if (isChartLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md sm:p-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded mb-4" />
        <div className="h-[310px] w-full bg-gray-50 dark:bg-gray-800/50 rounded" />
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-white/5 dark:bg-gray-900/40 dark:backdrop-blur-md sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Target you've set for each month
          </p>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}