import { Metadata } from "next";
import RolesPage from "@/components/modules/user-management/roles/RolesPage";

export const metadata: Metadata = {
  title: "Roles | Flwbite POS",
  description: "Daftar role dan izin akses dalam sistem.",
};

export default function Page() {
  return <RolesPage />;
}
