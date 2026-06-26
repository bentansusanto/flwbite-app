import StockTakesPage from "@/components/modules/inventory/stock-takes/StockTakesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Takes | Flwbite POS",
  description: "Lakukan dan kelola audit serta penyesuaian inventaris.",
};

export default function Page() {
  return <StockTakesPage />;
}
