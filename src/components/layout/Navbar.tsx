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
  Sparkles,
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    db.getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/leads?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  const markAllRead = () => {
    notifications.forEach((n) => db.markNotificationRead(n.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 py-2.5 glass-panel border-b border-white/10 bg-[#070d1d]/80 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Mobile Brand Logo */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="relative group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-falcon-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-falcon-500/30 border border-white/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm tracking-wider text-white">FALCON</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-falcon-500/20 text-cyan-300 border border-falcon-500/30">
                CRM
              </span>
            </div>
            <span className="block text-[9px] text-slate-400 leading-tight">
              CNC Machinery
            </span>
          </div>
        </div>

        {/* Global Fast Search Bar (Desktop & Tablet) */}
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
            className="w-full glass-input rounded-xl pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </form>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="sm:hidden p-2 rounded-xl glass-pill text-slate-300 hover:text-white"
            title="Search Leads"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Add CTA on Tablet/Desktop */}
          <button
            onClick={onOpenQuickAdd}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-falcon-600 to-falcon-500 hover:from-falcon-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-falcon-600/30 border border-white/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t("nav_add_lead")}</span>
            <span className="text-[9px] font-mono bg-black/20 px-1.5 py-0.5 rounded-full border border-white/10">
              &lt;60s
            </span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white relative transition-all active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_#f43f5e] border border-white/30 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {isNotifOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2.5 w-80 sm:w-96 glass-modal rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      Notifications ({unreadCount})
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
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
                            ? "bg-transparent hover:bg-white/[0.04] text-slate-400"
                            : "bg-white/[0.06] hover:bg-white/[0.09] text-white"
                        }`}
                      >
                        {n.type === "follow_up_overdue" ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        ) : n.type === "lead_hot" ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] shrink-0 mt-1" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-200">{n.title}</p>
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
          <div className="flex items-center gap-2 border-l border-white/10 pl-2.5 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-2.5">
            <div className="relative">
              <img
                src={currentUser.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-full object-cover border border-cyan-500/40 shadow-sm"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border border-slate-950" />
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden md:inline truncate max-w-[120px]">
              {currentUser.full_name}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Row */}
      {isMobileSearchOpen && (
        <form onSubmit={handleSearchSubmit} className="mt-2.5 sm:hidden relative animate-in fade-in duration-150">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search")}
            autoFocus
            className="w-full glass-input rounded-xl pl-9 pr-9 rtl:pl-9 rtl:pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-2.5 text-slate-400 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}
    </header>
  );
}
