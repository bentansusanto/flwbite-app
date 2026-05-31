"use client";

import { useState, useEffect } from "react";
import { useLoginMutation, useGetCsrfTokenQuery } from "@/store/api/authApi";
import { staffLoginSchema, StaffLoginInput } from "./schema";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import Cookies from "js-cookie";

export const useLoginHook = () => {
  const [loginMode, setLoginMode] = useState<"staff" | "cashier">("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState("");
  const [domain, setDomain] = useState("");
  const router = useRouter();

  const [login, { isLoading }] = useLoginMutation();
  
  // Fetch CSRF token on mount
  useGetCsrfTokenQuery(undefined, {
    // Only fetch if we don't have it, or always on login page to be sure
    refetchOnMountOrArgChange: true 
  });

  useEffect(() => {
    // Extract domain from hostname (e.g., tenant1.flwbite.com -> tenant1)
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      
      // Handle local development (localhost or IP)
      if (hostname === "localhost" || hostname === "127.0.0.1" || parts.length < 2) {
        // Fallback ke tenant 'demo' untuk keperluan testing lokal
        setDomain("demo"); 
      } else {
        setDomain(parts[0]);
      }
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
      domain: domain,
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = staffLoginSchema.safeParse({ ...values, domain });
      if (!result.success) {
        const errors: any = {};
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0]] = issue.message;
          }
        });
        return errors;
      }
    },
    onSubmit: async (values, { setErrors }) => {
      try {
        const response = await login({
          ...values,
          domain,
        }).unwrap();
        
        // Save token to cookie with global path
        if (response.data?.access_token) {
          const cookieOptions = { expires: 7, path: '/' };
          Cookies.set("flwbite_token", response.data.access_token, cookieOptions);
          Cookies.set("flwbite_role", response.data.role, cookieOptions);
          if (response.data?.branch_id) {
            Cookies.set("flwbite_branch", response.data.branch_id, cookieOptions);
          }
        }
        
        // Use window.location.href instead of router.push to ensure 
        // cookies are fully synced before the next page load (Next.js Middleware fix)
        if (response.data?.role === "cashier") {
          window.location.href = "/orders/new";
        } else {
          window.location.href = "/";
        }
      } catch (err: any) {
        if (err?.data?.message) {
          setErrors({ identifier: err.data.message });
        } else {
          setErrors({ identifier: "Terjadi kesalahan saat login. Silakan coba lagi." });
        }
      }
    },
  });

  const handleCashierLogin = async () => {
    try {
      // Clear old cookies first to avoid conflict
      Cookies.remove("flwbite_token", { path: '/' });
      Cookies.remove("flwbite_role", { path: '/' });
      
      const response = await login({ 
        identifier: "cashier", // Make sure your API expects this identifier for PIN login
        pin, 
        domain 
      }).unwrap();
      
      console.log("Cashier Login Response:", response);
      
      // Save token to cookie with global path
      if (response.data?.access_token) {
        const cookieOptions = { expires: 1, path: '/' };
        Cookies.set("flwbite_token", response.data.access_token, cookieOptions);
        Cookies.set("flwbite_role", response.data.role || "cashier", cookieOptions);
        if (response.data?.branch_id) {
          Cookies.set("flwbite_branch", response.data.branch_id, cookieOptions);
        }

        // Force a small delay to ensure cookies are written before redirect
        setTimeout(() => {
          window.location.href = "/orders/new";
        }, 100);
      } else {
        alert("Login berhasil tapi token tidak ditemukan. Hubungi admin.");
      }
    } catch (err: any) {
      console.error("Cashier Login failed:", err);
      const msg = err?.data?.message || "PIN yang Anda masukkan salah.";
      alert(msg); // Show error to user
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => setPin("");
  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  return {
    loginMode,
    setLoginMode,
    showPassword,
    setShowPassword,
    pin,
    setPin,
    domain,
    formik,
    handleNumberClick,
    handleClear,
    handleDelete,
    handleCashierLogin,
    isLoading,
  };
};
