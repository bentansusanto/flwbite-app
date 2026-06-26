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


  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
    },
    colors: ["#34d399", "#059669"], // emerald-400 for Orders, emerald-600 for Revenue
    chart: {
      fontFamily: "Inter, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#34d399", "#059669"]
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100]
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      padding: { left: 20, right: 20 }
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val, { seriesIndex }) => {
          if (seriesIndex === 1) return formatCurrency(val); // Revenue
          return val.toString() + " pesanan"; // Total Orders
        }
      }
    },
    xaxis: {
      type: "category",
      categories: categories.length > 0 ? categories : ["Tidak Ada Data"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontWeight: 500 } }
    },
    yaxis: [
      {
        seriesName: "Total Pesanan",
        labels: {
          style: { colors: '#94a3b8', fontWeight: 500 },
        }
      },
      {
        opposite: true,
        seriesName: "Pendapatan",
        labels: {
          style: { colors: '#94a3b8', fontWeight: 500 },
          formatter: (val) => {
            if (val >= 1000000) return `${(val/1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val/1000).toFixed(0)}k`;
            return val.toString();
          }
        }
      }
    ],
  };

  const series = [
    {
      name: "Total Pesanan",
      data: salesData,
    },
    {
      name: "Pendapatan",
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white/90">
            Statistik
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Target yang telah Anda tetapkan untuk setiap bulan
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