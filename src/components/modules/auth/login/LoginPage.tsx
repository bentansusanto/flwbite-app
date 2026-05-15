"use client";

import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Selamat Datang Kembali
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Silakan pilih metode masuk Anda.
        </p>
      </div>
      <LoginForm />
    </div>
  );
};
