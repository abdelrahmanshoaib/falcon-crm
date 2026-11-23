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
    { href: "/pipeline", label: t("nav_pipeline"), icon: GitPullRequest },
    { href: "/exhibitions", label: t("nav_exhibitions"), icon: Building2 },
    { href: "/magnets", label: t("nav_magnets"), icon: Magnet },
    { href: "/whatsapp-qr", label: t("nav_whatsapp"), icon: QrCode },
    { href: "/reports", label: t("nav_reports"), icon: BarChart3 },
    { href: "/team", label: t("nav_team"), icon: ShieldCheck },
    { href: "/settings", label: t("nav_settings"), icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto relative">
          {/* 1. Dashboard */}
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors",
              pathname === "/" ? "text-falcon-400 font-semibold" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="truncate">{t("nav_dashboard")}</span>
          </Link>

          {/* 2. Leads */}
          <Link
            href="/leads"
            className={cn(
              "flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors",
              pathname === "/leads" ? "text-falcon-400 font-semibold" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="truncate">{t("nav_leads")}</span>
          </Link>

          {/* 3. PROMINENT CENTER ADD LEAD BUTTON */}
          <div className="flex flex-col items-center justify-center relative -top-3">
            <button
              onClick={onOpenQuickAdd}
              type="button"
              className="w-13 h-13 w-12 h-12 rounded-full bg-gradient-to-tr from-falcon-600 to-falcon-400 text-white flex items-center justify-center shadow-lg shadow-falcon-600/50 border-2 border-slate-900 active:scale-90 transition-transform"
              title={t("nav_add_lead")}
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[10px] font-bold text-falcon-400 mt-1 whitespace-nowrap">
              +&lt;60s
            </span>
          </div>

          {/* 4. Follow-ups */}
          <Link
            href="/followups"
            className={cn(
              "flex flex-col items-center justify-center py-1 text-[11px] font-medium relative transition-colors",
              pathname === "/followups" ? "text-falcon-400 font-semibold" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <div className="relative">
              <CalendarCheck className="w-5 h-5 mb-0.5" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                  {overdueCount}
                </span>
              )}
            </div>
            <span className="truncate">{t("nav_followups")}</span>
          </Link>

          {/* 5. More Menu */}
          <button
            onClick={() => setIsMoreOpen(true)}
            type="button"
            className="flex flex-col items-center justify-center py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>{t("filter")}</span>
          </button>
        </div>
      </div>

      {/* Slide-over More Menu for Mobile */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-slate-900 rounded-t-2xl border-t border-slate-800 max-h-[80vh] overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-falcon-400" />
                <h3 className="text-white font-bold text-sm">Falcon CRM Menu</h3>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all",
                      isActive
                        ? "bg-slate-800 text-falcon-400 border-falcon-500"
                        : "bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-4 h-4 text-falcon-400 shrink-0" />
                    <span className="truncate">{item.label}</span>
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
