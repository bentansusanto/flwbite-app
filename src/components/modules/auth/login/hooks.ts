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
        
        // Save token to cookie
        if (response.data?.access_token) {
          Cookies.set("flwbite_token", response.data.access_token, { expires: 7 }); // Expires in 7 days
          Cookies.set("flwbite_role", response.data.role, { expires: 7 });
          if (response.data?.branch_id) {
            Cookies.set("flwbite_branch", response.data.branch_id, { expires: 7 });
          }
        }
        
        if (response.data?.role === "cashier") {
          router.push("/orders/new");
        } else {
          router.push("/");
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
      const response = await login({ 
        identifier: "cashier", 
        pin, 
        domain 
      }).unwrap();
      
      // Save token to cookie
      if (response.data?.access_token) {
        Cookies.set("flwbite_token", response.data.access_token, { expires: 1 }); // PIN session might be shorter
        Cookies.set("flwbite_role", response.data.role || "cashier", { expires: 1 });
        if (response.data?.branch_id) {
          Cookies.set("flwbite_branch", response.data.branch_id, { expires: 1 });
        }
      }
      
      if (response.data?.role === "cashier") {
        router.push("/orders/new");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Cashier Login failed:", err);
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
