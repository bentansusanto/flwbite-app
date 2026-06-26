import TaxesPage from "@/components/modules/finance/taxes/TaxesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pajak | Flwbite POS",
  description: "Atur dan kelola persentase pajak untuk bisnis Anda.",
};

export default function Page() {
  return <TaxesPage />;
}
