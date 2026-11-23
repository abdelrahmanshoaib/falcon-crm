"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  CalendarCheck,
  Building2,
  Magnet,
  QrCode,
  BarChart3,
  ShieldCheck,
  Settings,
  PlusCircle,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onOpenQuickAdd: () => void;
  overdueCount?: number;
}

export function Sidebar({ onOpenQuickAdd, overdueCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { currentUser, can } = useAuth();

  const navItems = [
    { href: "/", label: t("nav_dashboard"), icon: LayoutDashboard },
    { href: "/leads", label: t("nav_leads"), icon: Users },
    { href: "/pipeline", label: t("nav_pipeline"), icon: GitPullRequest },
    {
      href: "/followups",
      label: t("nav_followups"),
      icon: CalendarCheck,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    { href: "/exhibitions", label: t("nav_exhibitions"), icon: Building2 },
    { href: "/magnets", label: t("nav_magnets"), icon: Magnet },
    { href: "/whatsapp-qr", label: t("nav_whatsapp"), icon: QrCode },
    { href: "/reports", label: t("nav_reports"), icon: BarChart3 },
    { href: "/team", label: t("nav_team"), icon: ShieldCheck, permission: "view_all_leads" },
    { href: "/settings", label: t("nav_settings"), icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-falcon-600 to-falcon-400 flex items-center justify-center text-white shadow-md shadow-falcon-600/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-wide">
              FALCON CNC
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Exhibition CRM</p>
          </div>
        </div>
      </div>

      {/* Prominent Quick Add Lead Button */}
      <div className="p-3">
        <button
          onClick={onOpenQuickAdd}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-falcon-600 hover:bg-falcon-500 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t("nav_add_lead")}</span>
          <span className="text-[10px] bg-falcon-700/60 px-1.5 py-0.5 rounded font-mono">
            &lt;60s
          </span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-1">
        {navItems.map((item) => {
          if (item.permission && !can(item.permission)) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-falcon-400 border-l-2 border-falcon-500 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-falcon-400" : "text-slate-400")} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
            alt={currentUser.full_name}
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser.full_name}
            </p>
            <p className="text-[10px] text-slate-400 capitalize truncate">
              {currentUser.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
