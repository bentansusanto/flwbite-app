import { Metadata } from "next";
import PermissionsPage from "@/components/modules/user-management/permissions/PermissionsPage";

export const metadata: Metadata = {
  title: "Permissions | Flwbite POS",
  description: "Semua izin akses yang tersedia dalam sistem.",
};

export default function Page() {
  return <PermissionsPage />;
}
