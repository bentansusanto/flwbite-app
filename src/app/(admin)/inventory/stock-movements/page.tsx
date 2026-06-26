import StockMovementsPage from "@/components/modules/inventory/stock-movements/StockMovementsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Movements | Flwbite POS",
  description: "Pantau perubahan dan riwayat inventaris di seluruh cabang.",
};

export default function Page() {
  return <StockMovementsPage />;
}
