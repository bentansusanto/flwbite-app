import PromotionsPage from "@/components/modules/marketing/promotions/PromotionsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promotions | Flwbite POS",
  description: "Create and manage marketing campaigns and discount codes.",
};

export default function Page() {
  return <PromotionsPage />;
}
