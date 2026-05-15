import StockMovementsPage from "@/components/modules/inventory/stock-movements/StockMovementsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Movements | Flwbite POS",
  description: "Monitor inventory changes and history across branches.",
};

export default function Page() {
  return <StockMovementsPage />;
}
