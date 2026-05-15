"use client";

import { useState } from "react";
import { UserInput } from "./schema";

export const useUserHook = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (values: UserInput) => {
    setIsLoading(true);
    try {
      // Logic for creating user
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleCreateUser,
  };
};
