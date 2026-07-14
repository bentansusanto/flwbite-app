import { apiSlice } from "./apiSlice";

export interface SalesReportResponse {
  total_sales: number;
  total_orders: number;
  average_order: number;
  period: string;
}

export interface DashboardStatsResponse {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
}

export interface ChartPoint {
  label: string;
  sales: number;
  revenue: number;
}

export interface SalesChartResponse {
  points: ChartPoint[];
}

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query<{ data: SalesReportResponse }, { period: string; branch_id?: string }>({
      query: ({ period, branch_id }) => ({
        url: "/reports/sales",
        params: { period, branch_id },
      }),
      providesTags: ["Order"],
    }),
    getDashboardStats: builder.query<{ data: DashboardStatsResponse }, void>({
      query: () => "/reports/dashboard",
      providesTags: ["Order", "Customer", "Product"],
    }),
    getSalesChart: builder.query<{ data: SalesChartResponse }, { period: string; branch_id?: string; start_date?: string; end_date?: string }>({
      query: ({ period, branch_id, start_date, end_date }) => ({
        url: "/reports/chart",
        params: { period, branch_id, start_date, end_date },
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const { useGetSalesReportQuery, useGetDashboardStatsQuery, useGetSalesChartQuery } = reportApi;
