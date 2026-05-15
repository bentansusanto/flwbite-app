import SuppliersPage from "@/components/modules/suppliers/SuppliersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suppliers | Flwbite POS",
  description: "Manage your product suppliers and contact information.",
};

export default function Page() {
  return <SuppliersPage />;
}
