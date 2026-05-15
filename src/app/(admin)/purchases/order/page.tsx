import PurchaseOrdersPage from "@/components/modules/purchases/order/PurchaseOrdersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Orders | Flwbite POS",
  description: "Create and track orders sent to your suppliers.",
};

export default function Page() {
  return <PurchaseOrdersPage />;
}
