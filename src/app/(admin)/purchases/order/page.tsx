import PurchaseOrdersPage from "@/components/modules/purchases/order/PurchaseOrdersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Orders | Flwbite POS",
  description: "Buat dan lacak pesanan yang dikirim ke pemasok Anda.",
};

export default function Page() {
  return <PurchaseOrdersPage />;
}
