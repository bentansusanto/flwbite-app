import { LoginPage } from "@/components/modules/auth/login/LoginPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Flwbite POS",
  description: "Sign in to your Flwbite POS account",
};

export default function Login() {
  return <LoginPage />;
}
