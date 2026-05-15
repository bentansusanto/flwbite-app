import { Metadata } from "next";
import BranchPage from "@/components/modules/branches/BranchPage";

export const metadata: Metadata = {
  title: "Cabang | Flwbite POS",
  description: "Kelola semua cabang bisnis Anda.",
};

export default function Page() {
  return <BranchPage />;
}
