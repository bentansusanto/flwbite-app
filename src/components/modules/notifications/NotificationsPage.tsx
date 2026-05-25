"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCheck, Settings, ShieldAlert, ShoppingBag, Package, Trash2, Search } from "lucide-react";
import Button from "@/components/ui/button/Button";

type NotificationType = "system" | "order" | "inventory" | "security";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "security",
    title: "Terry Franci requests permission",
    message: "Requested permission to change Project - Nganter App settings.",
    timestamp: "5 mins ago",
    isRead: false,
    avatar: "/images/user/user-02.jpg",
  },
  {
    id: "n2",
    type: "order",
    title: "New Large Order Received",
    message: "Order #ORD-2023-089 has been placed for 15 items totaling Rp 2,500,000.",
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: "n3",
    type: "inventory",
    title: "Low Stock Alert: Kopi Susu Aren",
    message: "Only 5 cups remaining in stock at Cabang Utama. Please restock soon.",
    timestamp: "2 hours ago",
    isRead: true,
  },
  {
    id: "n4",
    type: "security",
    title: "Alena Franci requests permission",
    message: "Requested permission to update User Roles.",
    timestamp: "3 hours ago",
    isRead: true,
    avatar: "/images/user/user-03.jpg",
  },
  {
    id: "n5",
    type: "system",
    title: "System Update Completed",
    message: "Version 2.4.0 has been successfully deployed. Check release notes.",
    timestamp: "1 day ago",
    isRead: true,
  },
];

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "system" | "order">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "unread") return !n.isRead && matchesSearch;
    if (activeTab === "system") return (n.type === "system" || n.type === "security") && matchesSearch;
    if (activeTab === "order") return (n.type === "order" || n.type === "inventory") && matchesSearch;
    return matchesSearch;
  });

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case "system":
        return <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
      case "order":
        return <ShoppingBag className="w-5 h-5 text-brand-500" />;
      case "inventory":
        return <Package className="w-5 h-5 text-orange-500" />;
      case "security":
        return <ShieldAlert className="w-5 h-5 text-error-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage your alerts, system updates, and requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={markAllAsRead}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Mark all read</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "order", label: "Orders & Inventory" },
            { id: "system", label: "System & Security" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
              {tab.id === "unread" && notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <CheckCheck className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">All caught up!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">You have no new notifications in this section.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group flex items-start gap-4 p-5 sm:p-6 transition-colors ${
                  notification.isRead 
                    ? "bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]" 
                    : "bg-brand-50/30 hover:bg-brand-50/60 dark:bg-brand-900/10 dark:hover:bg-brand-900/20"
                }`}
              >
                {/* Avatar / Icon */}
                <div className="relative shrink-0">
                  {notification.avatar ? (
                    <Image
                      src={notification.avatar}
                      alt="Avatar"
                      width={44}
                      height={44}
                      className="rounded-full object-cover border border-gray-200 dark:border-gray-800"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      {getIconForType(notification.type)}
                    </div>
                  )}
                  {!notification.isRead && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`text-sm sm:text-base mb-1 ${notification.isRead ? "font-medium text-gray-800 dark:text-gray-200" : "font-semibold text-gray-900 dark:text-white"}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    
                    {/* Actions & Time */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {notification.timestamp}
                      </span>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        {!notification.isRead && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
