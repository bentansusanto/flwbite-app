import { Metadata } from "next";
import TenantPage from "@/components/modules/tenants/TenantPage";

export const metadata: Metadata = {
  title: "Tenant | Flwbite POS",
  description: "Kelola profil bisnis dan cabang Anda.",
};

export default function Page() {
  return <TenantPage />;
}
