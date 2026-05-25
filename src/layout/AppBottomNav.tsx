"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, ShootingStarIcon, TimeIcon, HorizontaLDots } from "../icons/index";
import { useSidebar } from "@/context/SidebarContext";
import Cookies from "js-cookie";

export default function AppBottomNav() {
  const pathname = usePathname();
  const { toggleMobileSidebar } = useSidebar();
  const [role, setRole] = useState<string>("staff");

  useEffect(() => {
    setRole(Cookies.get("flwbite_role") || "staff");
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: <GridIcon />, allowedRoles: ["owner", "admin", "super_admin"] },
    { name: "POS", path: "/orders/new", icon: <ShootingStarIcon /> },
    { name: "Orders", path: "/orders/history", icon: <TimeIcon /> },
  ].filter(item => !item.allowedRoles || item.allowedRoles.includes(role));

  return (
    <div className="fixed bottom-0 left-0 z-[100] w-full h-16 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 dark:bg-[#06060a]/95 dark:border-white/5 lg:hidden flex justify-around items-center px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? "text-brand-500" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <div className={`flex items-center justify-center w-6 h-6 ${isActive ? "[&>svg]:fill-brand-500" : "[&>svg]:fill-current"}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "text-brand-500 font-bold" : ""}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
      
      {/* Menu Toggle */}
      <button
        onClick={toggleMobileSidebar}
        className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <div className="flex items-center justify-center w-6 h-6 [&>svg]:fill-current">
          <HorizontaLDots />
        </div>
        <span className="text-[10px] font-medium">Menu</span>
      </button>
    </div>
  );
}
