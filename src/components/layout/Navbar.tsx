"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import { AppNotification } from "@/types/crm";
import {
  Bell,
  Search,
  PlusCircle,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onOpenQuickAdd: () => void;
}

export function Navbar({ onOpenQuickAdd }: NavbarProps) {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    db.getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/leads?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const markAllRead = () => {
    notifications.forEach((n) => db.markNotificationRead(n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Logo Brand */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-falcon-600 to-falcon-400 flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide">FALCON CRM</span>
            <span className="block text-[10px] text-falcon-400 leading-none">
              CNC Machinery
            </span>
          </div>
        </div>

        {/* Global Fast Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md hidden sm:flex items-center relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search")}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-falcon-500 focus:border-falcon-500 transition-all"
          />
        </form>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Add CTA on Tablet/Desktop */}
          <button
            onClick={onOpenQuickAdd}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-falcon-600 hover:bg-falcon-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t("nav_add_lead")}</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {isNotifOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-falcon-400" />
                    <span className="text-xs font-bold text-white">
                      Notifications ({unreadCount})
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-falcon-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          db.markNotificationRead(n.id);
                          setNotifications((prev) =>
                            prev.map((item) =>
                              item.id === n.id ? { ...item, is_read: true } : item
                            )
                          );
                          if (n.related_lead_id) {
                            router.push(`/leads?leadId=${n.related_lead_id}`);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3 text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                          n.is_read
                            ? "bg-slate-900/50 hover:bg-slate-800/60 text-slate-400"
                            : "bg-slate-800/70 hover:bg-slate-800 text-white"
                        }`}
                      >
                        {n.type === "follow_up_overdue" ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        ) : n.type === "lead_hot" ? (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {n.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current User Pill */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-3">
            <img
              src={currentUser.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
              alt={currentUser.full_name}
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <span className="text-xs font-medium text-slate-200 hidden md:inline truncate max-w-[120px]">
              {currentUser.full_name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
