import LoyaltyPointsPage from "@/components/modules/marketing/loyalty/LoyaltyPointsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loyalty Points | Flwbite POS",
  description: "Configure point rewards and track customer loyalty engagement.",
};

export default function Page() {
  return <LoyaltyPointsPage />;
}
