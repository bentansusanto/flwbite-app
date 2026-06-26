import SuppliersPage from "@/components/modules/suppliers/SuppliersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pemasok | Flwbite POS",
  description: "Kelola pemasok produk dan informasi kontak Anda.",
};

export default function Page() {
  return <SuppliersPage />;
}
