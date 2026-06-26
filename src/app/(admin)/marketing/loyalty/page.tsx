import LoyaltyPointsPage from "@/components/modules/marketing/loyalty/LoyaltyPointsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poin Loyalitas | Flwbite POS",
  description: "Atur hadiah poin dan lacak keterlibatan loyalitas pelanggan.",
};

export default function Page() {
  return <LoyaltyPointsPage />;
}
