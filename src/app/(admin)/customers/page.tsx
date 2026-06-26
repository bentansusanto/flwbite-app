import CustomersPage from "@/components/modules/customers/CustomersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pelanggan | Flwbite POS",
  description: "Kelola hubungan pelanggan dan program loyalitas Anda.",
};

export default function Page() {
  return <CustomersPage />;
}
