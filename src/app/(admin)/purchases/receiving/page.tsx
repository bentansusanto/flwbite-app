import PurchaseReceivingPage from "@/components/modules/purchases/receiving/PurchaseReceivingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Receiving | Flwbite POS",
  description: "Manage and confirm incoming shipments from suppliers.",
};

export default function Page() {
  return <PurchaseReceivingPage />;
}
