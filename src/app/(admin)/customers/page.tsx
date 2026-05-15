import CustomersPage from "@/components/modules/customers/CustomersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers | Flwbite POS",
  description: "Manage your customer relationships and loyalty programs.",
};

export default function Page() {
  return <CustomersPage />;
}
