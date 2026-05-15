import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register Disabled | Flwbite POS",
  description: "Registration is currently disabled",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrasi Dinonaktifkan</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Pendaftaran akun baru saat ini tidak tersedia secara publik. 
        Silakan hubungi administrator Anda untuk mendapatkan akses.
      </p>
      <Link 
        href="/login" 
        className="text-gray-900 dark:text-white font-semibold underline underline-offset-4"
      >
        Kembali ke Halaman Login
      </Link>
    </div>
  );
}
