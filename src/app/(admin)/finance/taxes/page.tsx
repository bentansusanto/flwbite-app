import TaxesPage from "@/components/modules/finance/taxes/TaxesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taxes | Flwbite POS",
  description: "Configure and manage tax rates for your business.",
};

export default function Page() {
  return <TaxesPage />;
}
