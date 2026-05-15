"use client";

import React from "react";

export const UserPage = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        User Management
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Manage users and their access levels.
      </p>
      
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">User list coming soon...</p>
      </div>
    </div>
  );
};
