"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useLoginHook } from "./hooks";

export const LoginForm = () => {
  const {
    loginMode,
    setLoginMode,
    showPassword,
    setShowPassword,
    pin,
    handleNumberClick,
    handleClear,
    handleDelete,
    handleCashierLogin,
    isLoading,
    domain,
    formik,
  } = useLoginHook();

  const isIdentifierError = !!(formik.touched.identifier && formik.errors.identifier);
  const isPasswordError = !!(formik.touched.password && formik.errors.password);

  return (
    <div className="grid gap-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-950 rounded-xl border dark:border-white/5">
        <button
          onClick={() => setLoginMode("staff")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            loginMode === "staff"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Staff
        </button>
        <button
          onClick={() => setLoginMode("cashier")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            loginMode === "cashier"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Kasir
        </button>
      </div>

      <form onSubmit={loginMode === "staff" ? formik.handleSubmit : (e) => e.preventDefault()}>
        {loginMode === "staff" ? (
          <div className="grid gap-4">
            <div>
              <Label>Email atau Username</Label>
              <Input
                name="identifier"
                placeholder="nama@perusahaan.com atau username"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.identifier}
                error={isIdentifierError}
                hint={isIdentifierError ? (formik.errors.identifier as string) : undefined}
              />
            </div>
            
            <div>
              <div className="mb-1">
                <Label>Kata Sandi</Label>
              </div>
              <div className="relative">
                <Input
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  error={isPasswordError}
                  hint={isPasswordError ? (formik.errors.password as string) : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ${isPasswordError ? 'top-[22px]' : 'top-1/2 -translate-y-1/2'}`}
                >
                  {showPassword ? (
                    <EyeIcon className="w-5 h-5" />
                  ) : (
                    <EyeCloseIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox checked={false} onChange={() => {}} />
              <label className="text-sm font-medium leading-none text-gray-600 dark:text-gray-400">
                Ingat saya
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 bg-brand-500 text-white hover:bg-brand-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 rounded-lg w-full transition-colors"
            >
              {isLoading ? "Memproses..." : "Masuk sebagai Staff"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <Label className="mb-4 text-gray-500">Masukkan PIN Kasir</Label>
              <div className="flex gap-3 justify-center mb-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pin.length > i
                        ? "bg-gray-900 border-gray-900 dark:bg-white dark:border-white"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">PIN Anda terdiri dari 6 digit</p>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumberClick(num.toString())}
                  className="h-16 text-xl font-semibold rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-16 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleNumberClick("0")}
                className="h-16 text-xl font-semibold rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-16 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              </button>
            </div>

            <Button
              onClick={handleCashierLogin}
              type="button"
              disabled={pin.length < 6 || isLoading}
              className="h-14 bg-brand-500 text-white hover:bg-brand-600 disabled:bg-gray-400 dark:disabled:bg-gray-700 rounded-xl w-full text-lg shadow-lg transition-colors"
            >
              {isLoading ? "Memproses..." : "Masuk Sekarang"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
