"use client";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Button from "@/components/ui/button/Button";

import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useGetTransactionsQuery } from "@/store/api/orderApi";
import { useGetSalesChartQuery, useGetSalesReportQuery } from "@/store/api/reportApi";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  ChevronDown,
  DollarSign,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
  Users,
  Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useSalesReport } from "./hooks";
import { orderApi } from "@/store/api/orderApi";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function SalesReportPage() {
  const { formik, period, handlePeriodChange } = useSalesReport();
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [triggerExportData] = orderApi.endpoints.getTransactions.useLazyQuery();

  useEffect(() => {
    if (!datePickerRef.current) return;

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "M d",
      clickOpens: true,
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          const start = format(selectedDates[0], "yyyy-MM-dd");
          const end = format(selectedDates[1], "yyyy-MM-dd");
          formik.setFieldValue("start_date", start);
          formik.setFieldValue("end_date", end);
          formik.handleSubmit();
        } else if (selectedDates.length === 0) {
          formik.setFieldValue("start_date", "");
          formik.setFieldValue("end_date", "");
          formik.handleSubmit();
        }
      },
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, [formik]);

  const { data: branchesData } = useGetBranchesQuery({});
  const { data: reportData } = useGetSalesReportQuery({
    period,
    branch_id: formik.values.branch_id
  });
  const { data: chartResponse } = useGetSalesChartQuery({
    period,
    branch_id: formik.values.branch_id
  });
  const { data: transactionsData, isLoading: isLoadingTrx } = useGetTransactionsQuery({
    branch_id: formik.values.branch_id,
    status: formik.values.status,
    start_date: formik.values.start_date,
    end_date: formik.values.end_date,
    search: formik.values.search,
    page: formik.values.page,
    limit: formik.values.limit
  });

  const branches = branchesData?.data || [];
  const report = reportData?.data;
  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination;
  const chartPoints = chartResponse?.data?.points || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getExportData = async () => {
    setIsExporting(true);
    try {
      // Fetch all data for export (high limit)
      const result = await triggerExportData({
        branch_id: formik.values.branch_id,
        status: formik.values.status,
        start_date: formik.values.start_date,
        end_date: formik.values.end_date,
        limit: 2000, // Reasonable high limit for export
      }).unwrap();
      return result.data;
    } catch (err) {
      console.error("Export failed", err);
      return [];
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    const allData = await getExportData();
    if (!allData || allData.length === 0) return;

    const summaryData = [
      ["LAPORAN PERFORMA PENJUALAN"],
      ["Periode", formik.values.start_date && formik.values.end_date ? `${formik.values.start_date} hingga ${formik.values.end_date}` : period.toUpperCase()],
      ["Cabang", branches.find((b: any) => b.id === formik.values.branch_id)?.name || "Semua Cabang"],
      ["Total Transaksi", allData.length],
      ["Total Pendapatan", formatCurrency(allData.reduce((acc: number, curr: any) => acc + curr.final_amount, 0))],
      [], // Spacer
      ["ID Faktur", "Tanggal", "Pelanggan", "Item", "Pembayaran", "Status", "Jumlah"]
    ];

    const tableData = allData.map((sale: any) => [
      sale.order_number,
      format(new Date(sale.created_at), "dd MMM yyyy HH:mm"),
      sale.customer_name || "Tamu",
      sale.items?.length || 0,
      sale.payment_method,
      sale.status,
      sale.final_amount
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...summaryData, ...tableData]);

    // Simple column width
    const wscols = [
      { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, `Report_Sales_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`);
  };

  const handleExportPDF = async () => {
    const allData = await getExportData();
    if (!allData || allData.length === 0) return;

    const doc = new jsPDF();
    const totalRevenue = allData.reduce((acc: number, curr: any) => acc + curr.final_amount, 0);
    const dateRange = formik.values.start_date && formik.values.end_date
      ? `${formik.values.start_date} hingga ${formik.values.end_date}`
      : `Periode: ${period.toUpperCase()}`;

    // Header Design
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN PENJUALAN", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Cabang: ${branches.find((b: any) => b.id === formik.values.branch_id)?.name || "Semua Cabang"}`, 14, 28);
    doc.text(`${dateRange}`, 14, 34);

    // Summary Box
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.roundedRect(140, 10, 56, 20, 2, 2, 'F');
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFontSize(8);
    doc.text("TOTAL PENDAPATAN", 145, 16);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(totalRevenue), 145, 24);

    const tableData = allData.map((sale: any) => [
      sale.order_number,
      format(new Date(sale.created_at), "dd MMM yyyy"),
      sale.customer_name || "Tamu",
      sale.payment_method,
      sale.status,
      { content: formatCurrency(sale.final_amount), styles: { halign: 'right' } }
    ]);

    autoTable(doc, {
      head: [["ID Faktur", "Tanggal", "Pelanggan", "Pembayaran", "Status", "Jumlah"]],
      body: tableData,
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        5: { fontStyle: 'bold' }
      },
      margin: { top: 50 }
    });

    doc.save(`Report_Sales_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
  };

  const chartOptions: ApexCharts.ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
    },
    colors: ["#34d399", "#059669"], // emerald-400 for Orders, emerald-600 for Revenue
    chart: {
      fontFamily: "Inter, sans-serif",
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
          return val.toString() + " pesanan"; // Total Pesanan
        }
      }
    },
    xaxis: {
      type: "category",
      categories: chartPoints.map(p => format(new Date(p.label), "dd MMM")),
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

  const chartSeries = [
    {
      name: 'Total Pesanan',
      data: chartPoints.map(p => p.sales)
    },
    {
      name: 'Pendapatan',
      data: chartPoints.map(p => p.revenue)
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan Penjualan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-normal text-sm">Pantau dan analisis performa pendapatan Anda dari waktu ke waktu.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportExcel}
            variant="outline"
            disabled={isExporting}
            startIcon={isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} className="text-emerald-600" />}
          >
            {isExporting ? "Memproses..." : "Ekspor Excel"}
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            startIcon={isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            className="shadow-lg shadow-brand-200"
          >
            {isExporting ? "Memproses..." : "Ekspor PDF"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pendapatan Kotor", value: formatCurrency(reportData?.data.total_sales || 0), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", darkBg: "dark:bg-emerald-500/10", trend: "+12.5%", isUp: true },
          { label: "Total Pesanan", value: reportData?.data.total_orders || 0, icon: ShoppingCart, color: "text-brand-600", bg: "bg-brand-50", darkBg: "dark:bg-brand-500/10", trend: "+5.2%", isUp: true },
          { label: "Rata-rata Pesanan", value: formatCurrency(reportData?.data.average_order || 0), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", darkBg: "dark:bg-amber-500/10", trend: "-2.4%", isUp: false },
          { label: "Pelanggan Aktif", value: "1,284", icon: Users, color: "text-rose-600", bg: "bg-rose-50", darkBg: "dark:bg-rose-500/10", trend: "+8.1%", isUp: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 ${stat.bg} ${stat.darkBg} rounded-xl ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${stat.isUp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'}`}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Analytics Chart */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Analitik Pendapatan</h3>
            <p className="text-xs text-gray-400 font-medium">Pelacakan performa harian</p>
          </div>
          <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
            {[
              { label: 'HARIAN', value: 'daily' },
              { label: 'MINGGUAN', value: 'weekly' },
              { label: 'BULANAN', value: 'monthly' }
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value as any)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  period === p.value
                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={320}
          />
        </div>
      </div>

      {/* Sales Table Section */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 dark:border-white/5 bg-white dark:bg-transparent space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transaksi Terbaru</h3>
              <p className="text-xs text-gray-400 font-medium italic text-emerald-400">Ringkasan performa penjualan terbaru</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari faktur..."
                  className="pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-white border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none w-full sm:w-64 transition-all"
                  value={formik.values.search}
                  onChange={(e) => formik.setFieldValue("search", e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && formik.handleSubmit()}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button onClick={() => formik.handleSubmit()} className="h-[42px] px-4 shadow-sm shadow-brand-100/50 flex-1 sm:flex-none">
                  <Filter size={16} />
                </Button>
                <button onClick={() => formik.resetForm()} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 h-[42px] text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 transition-colors flex-1 sm:flex-none">
                  <RefreshCcw size={16} /> Atur Ulang
                </button>
              </div>
            </div>
          </div>

          {/* Table Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-gray-300 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer"
                value={formik.values.branch_id}
                onChange={(e) => {
                  formik.setFieldValue("branch_id", e.target.value);
                  formik.handleSubmit();
                }}
              >
                <option value="">Semua Cabang</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
              </div>
              <select
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-gray-300 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer"
                value={formik.values.status}
                onChange={(e) => {
                  formik.setFieldValue("status", e.target.value);
                  formik.handleSubmit();
                }}
              >
                <option value="">Semua Status</option>
                <option value="PAID">Dibayar</option>
                <option value="COMPLETED">Selesai</option>
                <option value="PENDING">Tertunda</option>
                <option value="CANCELLED">Dibatalkan</option>
                <option value="REFUNDED">Dikembalikan</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative md:col-span-2">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <div>
                <input
                  ref={datePickerRef}
                  placeholder="Pilih rentang tanggal"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 dark:text-gray-300 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingTrx ? (
            <div className="py-20 text-center text-gray-400 dark:text-gray-500 font-medium">Mengambil transaksi...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-white/5">
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Faktur</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pelanggan</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pembayaran</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Jumlah</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 font-medium">Tidak ada transaksi ditemukan</td>
                  </tr>
                ) : (
                  transactions.map((sale: any) => (
                    <tr key={sale.id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors group">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{sale.order_number}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {new Date(sale.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-300">{sale.customer_name}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-400">{sale.items?.length || 0} item</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400">{sale.payment_method}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(sale.final_amount)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                          sale.status === 'COMPLETED' || sale.status === 'PAID' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                          sale.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                          'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-white/5 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-gray-50/30 dark:bg-transparent">
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {transactions.length === 0 ? "0 transaksi" : `${((formik.values.page - 1) * formik.values.limit) + 1}–${Math.min(formik.values.page * formik.values.limit, pagination?.total || 0)} dari ${pagination?.total || 0} transaksi`}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Tampilkan</span>
              <select
                value={formik.values.limit}
                onChange={(e) => {
                  formik.setFieldValue("limit", Number(e.target.value));
                  formik.setFieldValue("page", 1);
                  formik.handleSubmit();
                }}
                className="h-7 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-300 font-bold"
              >
                {[5, 10, 25, 50].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">per halaman</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 justify-center sm:justify-end">
            <button
              onClick={() => {
                formik.setFieldValue("page", 1);
                formik.handleSubmit();
              }}
              disabled={formik.values.page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
              title="Halaman pertama"
            >
              <ChevronDown size={13} className="rotate-90" />
              <ChevronDown size={13} className="-ml-2 rotate-90" />
            </button>
            <button
              onClick={() => {
                formik.setFieldValue("page", formik.values.page - 1);
                formik.handleSubmit();
              }}
              disabled={formik.values.page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
              title="Halaman sebelumnya"
            >
              <ChevronDown size={13} className="rotate-90" />
            </button>

            {Array.from({ length: pagination?.total_pages || 1 }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === (pagination?.total_pages || 1) || Math.abs(p - formik.values.page) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (typeof p === "number") {
                      formik.setFieldValue("page", p);
                      formik.handleSubmit();
                    }
                  }}
                  disabled={p === "..." || p === formik.values.page}
                  className={`flex h-7 min-w-[28px] items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                    p === formik.values.page
                      ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                      : p === "..."
                      ? "border-transparent text-gray-400 dark:text-gray-500 cursor-default"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))
            }

            <button
              onClick={() => {
                formik.setFieldValue("page", formik.values.page + 1);
                formik.handleSubmit();
              }}
              disabled={formik.values.page >= (pagination?.total_pages || 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
              title="Halaman berikutnya"
            >
              <ChevronDown size={13} className="-rotate-90" />
            </button>
            <button
              onClick={() => {
                formik.setFieldValue("page", pagination?.total_pages || 1);
                formik.handleSubmit();
              }}
              disabled={formik.values.page >= (pagination?.total_pages || 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
              title="Halaman terakhir"
            >
              <ChevronDown size={13} className="-rotate-90" />
              <ChevronDown size={13} className="-ml-2 -rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
