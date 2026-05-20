"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BellIcon,
  BoltIcon,
  BoxCubeIcon,
  BoxIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DollarLineIcon,
  FolderIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  LockIcon,
  PieChartIcon,
  ShootingStarIcon,
  TaskIcon,
  TimeIcon,
  UserCircleIcon,
  UserIcon,
} from "../icons/index";


import { useGetBranchesQuery } from "@/store/api/branchApi";
import { useGetMeTenantQuery } from "@/store/api/tenantApi";
import Cookies from "js-cookie";
import { Store } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; allowedRoles?: string[] }[];
  allowedRoles?: string[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    allowedRoles: ["owner", "admin", "super_admin"],
  },
  {
    name: "POS",
    icon: <ShootingStarIcon />,
    path: "/orders/new",
    allowedRoles: ["owner", "admin", "cashier", "super_admin"],
  },
  {
    name: "Transactions",
    icon: <TimeIcon />,
    path: "/orders/history",
    allowedRoles: ["owner", "admin", "cashier", "super_admin"],
  },
  {
    name: "Management",
    icon: <TaskIcon />,
    allowedRoles: ["owner", "admin", "super_admin"],
    subItems: [
      { name: "POS Sessions", path: "/orders/session" },
    ],
  },
  {
    name: "Items & Services",
    icon: <BoxIcon />,
    allowedRoles: ["owner", "admin", "super_admin"],
    subItems: [
      { name: "Products", path: "/items-services/products" },
      { name: "Categories", path: "/items-services/categories" },
    ],
  },
  {
    name: "Inventory",
    icon: <BoxCubeIcon />,
    allowedRoles: ["owner", "admin", "super_admin"],
    subItems: [
      { name: "Product Stocks", path: "/inventory/product-stocks" },
      { name: "Stock Take", path: "/inventory/stock-takes" },
      { name: "Batches", path: "/inventory/product-batches" },
      { name: "Stock Movements", path: "/inventory/stock-movements" },
    ],
  },
  {
    name: "Suppliers",
    icon: <UserIcon />,
    path: "/suppliers",
    allowedRoles: ["owner", "admin", "super_admin"],
  },
  {
    name: "Purchases",
    icon: <BoxCubeIcon />,
    allowedRoles: ["owner", "admin", "super_admin"],
    subItems: [
      { name: "Purchase Order", path: "/purchases/order" },
      { name: "Purchase Receiving", path: "/purchases/receiving" },
    ],
  },
  {
    name: "Marketing",
    icon: <ShootingStarIcon />,
    allowedRoles: ["owner", "admin", "super_admin"],
    subItems: [
      { name: "Loyalty Program", path: "/marketing/loyalty" },
      { name: "Promotions", path: "/marketing/promotions" },
    ],
  },
  {
    name: "Finance",
    icon: <DollarLineIcon />,
    allowedRoles: ["owner", "admin", "super_admin"],
    subItems: [{ name: "Taxes", path: "/finance/taxes" }],
  },
  {
    name: "Reports",
    icon: <PieChartIcon />,
    allowedRoles: ["owner", "admin", "super_admin"],
    subItems: [{ name: "Laporan Penjualan", path: "/reports/sales" }],
  },
  {
    name: "Customers",
    icon: <UserCircleIcon />,
    path: "/customers",
    allowedRoles: ["owner", "admin", "cashier", "super_admin"],
  },
  {
    name: "Audit Log",
    icon: <TimeIcon />,
    path: "/audit-log",
    allowedRoles: ["owner", "super_admin"],
  },
  {
    name: "User Management",
    icon: <LockIcon />,
    allowedRoles: ["owner", "super_admin"],
    subItems: [
      { name: "Users", path: "/user-management/users" },
      { name: "Roles", path: "/user-management/roles" },
      { name: "Permissions", path: "/user-management/permissions" },
    ],
  },
  {
    name: "Tenants",
    icon: <Store size={20} />,
    path: "/tenants",
    allowedRoles: ["owner", "super_admin"],
  },
  {
    name: "Tenants (Admin)",
    icon: <GroupIcon />,
    path: "/tenants-admin",
    allowedRoles: ["super_admin"],
  },
  {
    name: "Notifications",
    icon: <BellIcon />,
    path: "/notifications",
  },
  {
    name: "Settings",
    icon: <BoltIcon />,
    path: "/settings",
    allowedRoles: ["owner", "admin", "super_admin"],
  },
];



const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();

  const [activeSubmenu, setActiveSubmenu] = useState<NavItem | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [userRole, setUserRole] = useState<string>("staff");
  const [activeBranchId, setActiveBranchId] = useState<string>("");

  const { data: branchesRes, isLoading: isLoadingBranches } = useGetBranchesQuery(undefined);
  const branches = branchesRes?.data || [];
  
  const { data: tenantRes } = useGetMeTenantQuery(undefined);
  const tenant = tenantRes?.data;

  // Dynamically update favicon based on tenant logo
  useEffect(() => {
    if (tenant?.logo) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = tenant.logo;
    }
  }, [tenant?.logo]);

  useEffect(() => {
    // Client-side only
    const role = Cookies.get("flwbite_role") || "staff";
    setUserRole(role);
    
    const currentBranch = Cookies.get("flwbite_branch");
    if (currentBranch) {
      setActiveBranchId(currentBranch);
    } else if (branches.length > 0) {
      Cookies.set("flwbite_branch", branches[0].id, { expires: 7 });
      setActiveBranchId(branches[0].id);
    }
  }, [branches]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    Cookies.set("flwbite_branch", val, { expires: 7 });
    setActiveBranchId(val);
    window.location.reload();
  };

  // Filter items based on role
  const filteredNavItems = navItems.filter(item => 
    !item.allowedRoles || item.allowedRoles.includes(userRole)
  );

  const renderMainItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => {
                setDirection("forward");
                setActiveSubmenu(nav);
              }}
              className={`menu-item group menu-item-inactive cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span className="menu-item-icon-inactive">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronRightIcon className="ml-auto w-5 h-5 transition-colors duration-200 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                onClick={() => {
                  if (isMobileOpen) toggleMobileSidebar();
                  setActiveSubmenu(null);
                }}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  const renderSubmenuItems = (parent: NavItem) => (
    <div className="flex flex-col">
      <button
        onClick={() => {
          setDirection("backward");
          setActiveSubmenu(null);
        }}
        className="flex items-center gap-2 px-3 py-2 mb-4 text-theme-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        <span>Back to Menu</span>
      </button>

      <div className="px-3 mb-4">
        <h3 className="text-theme-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-gray-500">{parent.icon}</span>
          {parent.name}
        </h3>
      </div>

      <ul className="flex flex-col gap-1">
        {parent.subItems?.filter(sub => !sub.allowedRoles || sub.allowedRoles.includes(userRole)).map((subItem) => (
          <li key={subItem.name}>
            <Link
              href={subItem.path}
              onClick={() => {
                if (isMobileOpen) toggleMobileSidebar();
              }}
              className={`menu-dropdown-item ${
                isActive(subItem.path)
                  ? "menu-dropdown-item-active"
                  : "menu-dropdown-item-inactive"
              }`}
            >
              {subItem.name}
              <span className="flex items-center gap-1 ml-auto">
                {subItem.new && (
                  <span
                    className={`ml-auto ${
                      isActive(subItem.path)
                        ? "menu-dropdown-badge-active"
                        : "menu-dropdown-badge-inactive"
                    } menu-dropdown-badge `}
                  >
                    new
                  </span>
                )}
                {subItem.pro && (
                  <span
                    className={`ml-auto ${
                      isActive(subItem.path)
                        ? "menu-dropdown-badge-active"
                        : "menu-dropdown-badge-inactive"
                    } menu-dropdown-badge `}
                  >
                    pro
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );



  // const isActive = (path: string) => path === pathname;
   const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let found = false;
    filteredNavItems.forEach((nav) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setActiveSubmenu(nav);
            found = true;
          }
        });
      }
    });
    if (!found) {
      setActiveSubmenu(null);
    }
  }, [pathname, isActive]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-[#06060a] dark:border-white/5 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" onClick={() => isMobileOpen && toggleMobileSidebar()} className="flex items-center gap-3 w-full">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3">
              {tenant?.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={tenant.logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover bg-white shadow-sm" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg shadow-sm">
                  {tenant?.name ? tenant.name.charAt(0).toUpperCase() : "F"}
                </div>
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {tenant?.name ? tenant.name.split(" ").slice(0, 2).join(" ") : "Flwbite"}
              </span>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              {tenant?.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={tenant.logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover bg-white shadow-sm" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg shadow-sm">
                  {tenant?.name ? tenant.name.charAt(0).toUpperCase() : "F"}
                </div>
              )}
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden min-h-[400px]">
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    activeSubmenu
                      ? "-translate-x-full opacity-0 pointer-events-none absolute w-full"
                      : "translate-x-0 opacity-100"
                  }`}
                >
                  {/* Branch Selector */}
                  {(isExpanded || isHovered || isMobileOpen) && branches.length > 0 && (
                    <div className="mb-6 px-1">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Pilih Cabang</p>
                      <div className="relative">
                        <select
                          value={activeBranchId}
                          onChange={handleBranchChange}
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-4 pr-10 text-sm font-semibold text-gray-700 outline-none transition hover:border-brand-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-300 dark:hover:border-gray-700 dark:focus:border-brand-500 cursor-pointer"
                        >
                          {branches.map((b: any) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                  )}
                  {/* End Branch Selector */}

                  <h2
                    className={`mb-4 text-theme-sm uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? (
                      "Menu"
                    ) : (
                      <HorizontaLDots />
                    )}
                  </h2>
                  {renderMainItems(filteredNavItems)}
                </div>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    activeSubmenu
                      ? "translate-x-0 opacity-100"
                      : "translate-x-full opacity-0 pointer-events-none absolute w-full"
                  }`}
                >
                  {activeSubmenu && renderSubmenuItems(activeSubmenu)}
                </div>
              </div>


          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
