import PromotionsPage from "@/components/modules/marketing/promotions/PromotionsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promosi | Flwbite POS",
  description: "Buat dan kelola kampanye pemasaran dan kode diskon.",
};

export default function Page() {
  return <PromotionsPage />;
}
