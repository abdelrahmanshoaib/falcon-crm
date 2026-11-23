"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Menu,
  Plus,
  GitPullRequest,
  Building2,
  Magnet,
  QrCode,
  BarChart3,
  ShieldCheck,
  Settings,
  X,
  Cpu,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onOpenQuickAdd: () => void;
  overdueCount?: number;
}

export function BottomNav({ onOpenQuickAdd, overdueCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreItems = [
    { href: "/pipeline", label: t("nav_pipeline"), icon: GitPullRequest, badge: "Kanban" },
    { href: "/exhibitions", label: t("nav_exhibitions"), icon: Building2 },
    { href: "/magnets", label: t("nav_magnets"), icon: Magnet, badge: "Lead Magnet" },
    { href: "/whatsapp-qr", label: t("nav_whatsapp"), icon: QrCode, badge: "Fast QR" },
    { href: "/reports", label: t("nav_reports"), icon: BarChart3 },
    { href: "/team", label: t("nav_team"), icon: ShieldCheck },
    { href: "/settings", label: t("nav_settings"), icon: Settings },
  ];

  return (
    <>
      {/* FLOATING LUXURY GLASS DOCK FOR MOBILE */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-lg mx-auto z-40 rounded-[28px] glass-dock px-2 py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
      >
        <div className="grid grid-cols-5 items-center relative h-14">
          {/* 1. Dashboard */}
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center py-1 rounded-2xl text-[10px] sm:text-[11px] font-medium transition-all relative",
              pathname === "/"
                ? "text-falcon-300 font-bold"
                : "text-slate-400 hover:text-slate-200 active:scale-95"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-xl transition-all",
                pathname === "/" && "bg-falcon-500/15 text-falcon-400 shadow-[0_0_12px_rgba(14,165,233,0.35)]"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="truncate mt-0.5">{t("nav_dashboard")}</span>
            {pathname === "/" && (
              <span className="w-1 h-1 rounded-full bg-falcon-400 absolute bottom-0.5 shadow-[0_0_6px_#38bdf8]" />
            )}
          </Link>

          {/* 2. Leads */}
          <Link
            href="/leads"
            className={cn(
              "flex flex-col items-center justify-center py-1 rounded-2xl text-[10px] sm:text-[11px] font-medium transition-all relative",
              pathname === "/leads"
                ? "text-falcon-300 font-bold"
                : "text-slate-400 hover:text-slate-200 active:scale-95"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-xl transition-all",
                pathname === "/leads" && "bg-falcon-500/15 text-falcon-400 shadow-[0_0_12px_rgba(14,165,233,0.35)]"
              )}
            >
              <Users className="w-5 h-5" />
            </div>
            <span className="truncate mt-0.5">{t("nav_leads")}</span>
            {pathname === "/leads" && (
              <span className="w-1 h-1 rounded-full bg-falcon-400 absolute bottom-0.5 shadow-[0_0_6px_#38bdf8]" />
            )}
          </Link>

          {/* 3. PROMINENT FLOATING GLOWING JEWEL ADD LEAD BUTTON */}
          <div className="flex flex-col items-center justify-center relative -top-3.5">
            <button
              onClick={onOpenQuickAdd}
              type="button"
              className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform duration-200"
              title={t("nav_add_lead")}
            >
              {/* Outer Radiant Glow Ring */}
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-falcon-500 via-cyan-400 to-amber-400 opacity-80 blur-[6px] group-hover:opacity-100 group-hover:blur-md transition-all animate-pulse-glow" />

              {/* Elevated Glass Dome */}
              <span className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-falcon-500 via-falcon-600 to-slate-950 text-white flex items-center justify-center border-2 border-white/30 shadow-[0_8px_20px_rgba(14,165,233,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)]">
                <Plus className="w-6 h-6 stroke-[2.8] drop-shadow-md text-white group-hover:rotate-90 transition-transform duration-300" />
              </span>
            </button>
            <span className="text-[9px] font-black tracking-wider text-cyan-300 mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] whitespace-nowrap font-mono">
              +&lt;60s
            </span>
          </div>

          {/* 4. Follow-ups */}
          <Link
            href="/followups"
            className={cn(
              "flex flex-col items-center justify-center py-1 rounded-2xl text-[10px] sm:text-[11px] font-medium transition-all relative",
              pathname === "/followups"
                ? "text-falcon-300 font-bold"
                : "text-slate-400 hover:text-slate-200 active:scale-95"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-xl transition-all relative",
                pathname === "/followups" && "bg-falcon-500/15 text-falcon-400 shadow-[0_0_12px_rgba(14,165,233,0.35)]"
              )}
            >
              <CalendarCheck className="w-5 h-5" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-[0_0_8px_#f43f5e] border border-white/20 animate-pulse">
                  {overdueCount}
                </span>
              )}
            </div>
            <span className="truncate mt-0.5">{t("nav_followups")}</span>
            {pathname === "/followups" && (
              <span className="w-1 h-1 rounded-full bg-falcon-400 absolute bottom-0.5 shadow-[0_0_6px_#38bdf8]" />
            )}
          </Link>

          {/* 5. More Menu */}
          <button
            onClick={() => setIsMoreOpen(true)}
            type="button"
            className="flex flex-col items-center justify-center py-1 rounded-2xl text-[10px] sm:text-[11px] font-medium text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
          >
            <div className="p-1 rounded-xl hover:bg-white/5 transition-all">
              <Menu className="w-5 h-5" />
            </div>
            <span className="truncate mt-0.5">{t("filter")}</span>
          </button>
        </div>
      </nav>

      {/* LUXURY FROSTED BOTTOM-SHEET MORE MENU */}
      {isMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="glass-modal rounded-t-[32px] border-t border-white/20 max-h-[85vh] overflow-y-auto p-5 pb-8 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-600/60 mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-falcon-600 to-falcon-400 flex items-center justify-center text-white shadow-md shadow-falcon-600/30">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                    FALCON CNC CRM
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <p className="text-[10px] text-slate-400">Navigation & Operations Hub</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      "flex flex-col p-3 rounded-2xl border text-xs font-semibold transition-all relative overflow-hidden group",
                      isActive
                        ? "bg-gradient-to-br from-falcon-600/30 to-falcon-950/60 text-cyan-300 border-falcon-400/50 shadow-[0_0_20px_rgba(14,165,233,0.25)]"
                        : "glass-card glass-card-hover text-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-falcon-400 group-hover:text-cyan-300 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-100 group-hover:text-cyan-200 line-clamp-1">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
