import { apiSlice } from "./apiSlice";

export interface OrderItem {
  id: string;
  variant_id: string;
  variant_name?: string;
  product_name?: string;
  qty: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  type: string;
  status: string;
  customer_name: string;
  table_number: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  notes: string;
  created_at: string;
  refund_reason?: string;
  items: OrderItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<PaginatedResponse<Order>, any>({
      query: (params) => ({
        url: "/orders/history",
        params,
      }),
      transformResponse: (response: { data: PaginatedResponse<Order> }) => response.data,
      providesTags: ["Order"],
    }),
    createOrder: builder.mutation<any, any>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "PosSession", "Product", "Stock", "ProductBatch"],
    }),
    payOrder: builder.mutation<any, any>({
      query: (body) => ({
        url: "/orders/pay",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "PosSession", "Product", "Stock", "ProductBatch"],
    }),
    refundOrder: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/refund`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Order", "PosSession", "Product", "Stock", "ProductBatch"],
    }),
    cancelOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Order", "PosSession", "Product", "Stock", "ProductBatch"],
    }),
    completeOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: `/orders/${id}/complete`,
        method: "PATCH",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        // Find all cached queries for getTransactions and optimistically remove the order
        const state = getState() as any;
        const apiState = state.api.queries;
        
        const patches: any[] = [];
        
        for (const key of Object.keys(apiState)) {
          if (key.startsWith('getTransactions')) {
            const patch = dispatch(
              orderApi.util.updateQueryData('getTransactions', apiState[key].originalArgs, (draft) => {
                if (draft.data) {
                  const initialLength = draft.data.length;
                  draft.data = draft.data.filter((order) => order.id !== id);
                  if (draft.data.length < initialLength) {
                    draft.pagination.total -= 1;
                  }
                }
              })
            );
            patches.push(patch);
          }
        }
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: ["Order", "PosSession", "Product", "Stock", "ProductBatch"],
    }),
  }),
});

export const { useGetTransactionsQuery, useCreateOrderMutation, usePayOrderMutation, useRefundOrderMutation, useCancelOrderMutation, useCompleteOrderMutation } = orderApi;
