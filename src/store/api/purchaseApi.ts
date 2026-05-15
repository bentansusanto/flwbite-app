import { apiSlice } from "./apiSlice";

export const purchaseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: (params) => ({
        url: "/purchase-orders",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "PurchaseOrder" as const, id })),
              { type: "PurchaseOrder" as const, id: "LIST" },
            ]
          : [{ type: "PurchaseOrder" as const, id: "LIST" }],
    }),
    getPurchaseOrderById: builder.query({
      query: (id: string) => `/purchase-orders/${id}`,
      providesTags: (result, error, id) => [{ type: "PurchaseOrder" as const, id }],
    }),
    createPurchaseOrder: builder.mutation({
      query: (body) => ({
        url: "/purchase-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PurchaseOrder" as const, id: "LIST" }],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PurchaseOrder" as const, id },
        { type: "PurchaseOrder" as const, id: "LIST" },
      ],
    }),
    payPurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}/pay`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PurchaseOrder" as const, id },
        { type: "PurchaseOrder" as const, id: "LIST" },
      ],
    }),
    getPurchaseReceivings: builder.query({
      query: (params) => ({
        url: "/purchase-receivings",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "PurchaseReceiving" as const, id })),
              { type: "PurchaseReceiving" as const, id: "LIST" },
            ]
          : [{ type: "PurchaseReceiving" as const, id: "LIST" }],
    }),
    getPurchaseReceivingById: builder.query({
      query: (id: string) => `/purchase-receivings/${id}`,
      providesTags: (result, error, id) => [{ type: "PurchaseReceiving" as const, id }],
    }),
    createPurchaseReceiving: builder.mutation({
      query: (body) => ({
        url: "/purchase-receivings",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { purchase_order_id }) => [
        { type: "PurchaseReceiving" as const, id: "LIST" },
        { type: "PurchaseOrder" as const, id: "LIST" },
        { type: "PurchaseOrder" as const, id: purchase_order_id },
        { type: "Product" as const, id: "LIST" }, // Receiving updates stock
      ],
    }),
    cancelPurchaseOrder: builder.mutation({
      query: (id: string) => ({
        url: `/purchase-orders/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "PurchaseOrder" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  usePayPurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useGetPurchaseReceivingsQuery,
  useGetPurchaseReceivingByIdQuery,
  useCreatePurchaseReceivingMutation,
} = purchaseApi;
