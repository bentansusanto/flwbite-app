import React from "react";
import ProductStocksPage from "@/components/modules/inventory/product-stocks/ProductStocksPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Stocks | Flwbite POS",
  description: "Manage and monitor inventory levels across branches.",
};

export default function Page() {
  return <ProductStocksPage />;
}
