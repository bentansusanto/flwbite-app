import PurchaseReceivingPage from "@/components/modules/purchases/receiving/PurchaseReceivingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Receiving | Flwbite POS",
  description: "Kelola dan konfirmasi pengiriman masuk dari pemasok.",
};

export default function Page() {
  return <PurchaseReceivingPage />;
}
