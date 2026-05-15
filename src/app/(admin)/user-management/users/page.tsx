import { Metadata } from "next";
import UsersPage from "@/components/modules/user-management/users/UsersPage";

export const metadata: Metadata = {
  title: "Users | Flwbite POS",
  description: "Kelola akun pengguna dalam bisnis Anda.",
};

export default function Page() {
  return <UsersPage />;
}
