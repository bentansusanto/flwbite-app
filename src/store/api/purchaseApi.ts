import { apiSlice } from "./apiSlice";

export const purchaseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: (params) => ({
        url: "/purchase-orders",
        params,
      }),
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "PurchaseOrder" as const, id })),
              { type: "PurchaseOrder", id: "LIST" },
            ]
          : [{ type: "PurchaseOrder", id: "LIST" }],
    }),
    getPurchaseOrderById: builder.query({
      query: (id: string) => `/purchase-orders/${id}`,
      providesTags: (result, error, id) => [{ type: "PurchaseOrder", id }],
    }),
    createPurchaseOrder: builder.mutation({
      query: (body) => ({
        url: "/purchase-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PurchaseOrder", id: "LIST" },
        { type: "PurchaseOrder", id },
      ],
    }),
    payPurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}/pay`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PurchaseOrder", id: "LIST" },
        { type: "PurchaseOrder", id },
      ],
    }),
    getPurchaseReceivings: builder.query({
      query: (params) => ({
        url: "/purchase-receivings",
        params,
      }),
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: "PurchaseReceiving" as const, id })),
              { type: "PurchaseReceiving", id: "LIST" },
            ]
          : [{ type: "PurchaseReceiving", id: "LIST" }],
    }),
    getPurchaseReceivingById: builder.query({
      query: (id: string) => `/purchase-receivings/${id}`,
      providesTags: (result, error, id) => [{ type: "PurchaseReceiving", id }],
    }),
    createPurchaseReceiving: builder.mutation({
      query: (body) => ({
        url: "/purchase-receivings",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "PurchaseReceiving", id: "LIST" },
        { type: "PurchaseOrder", id: "LIST" },
        { type: "Product", id: "LIST" },
        { type: "Stock", id: "LIST" },
      ],
    }),
    cancelPurchaseOrder: builder.mutation({
      query: (id: string) => ({
        url: `/purchase-orders/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PurchaseOrder", id: "LIST" },
        { type: "PurchaseOrder", id },
      ],
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
