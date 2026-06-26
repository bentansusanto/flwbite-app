import React from "react";
import ProductStocksPage from "@/components/modules/inventory/product-stocks/ProductStocksPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Stocks | Flwbite POS", // Kept English matching menu
  description: "Kelola dan pantau tingkat inventaris di seluruh cabang.",
};

export default function Page() {
  return <ProductStocksPage />;
}
