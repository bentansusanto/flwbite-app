import ProductBatchesPage from "@/components/modules/inventory/product-batches/ProductBatchesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Batches | Flwbite POS",
  description: "Lacak tanggal kedaluwarsa dan kelola stok lot secara efisien.",
};

export default function Page() {
  return <ProductBatchesPage />;
}
