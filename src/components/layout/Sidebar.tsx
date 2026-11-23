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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onOpenQuickAdd: () => void;
  overdueCount?: number;
}

export function Sidebar({ onOpenQuickAdd, overdueCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { currentUser, currentRole } = useAuth();
  const isManagerOrAdmin = currentRole === "admin" || currentRole === "manager";

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
    { href: "/reports", label: t("nav_reports"), icon: BarChart3, managerOrAdmin: true },
    { href: "/team", label: t("nav_team"), icon: ShieldCheck, managerOrAdmin: true },
    { href: "/settings", label: t("nav_settings"), icon: Settings, managerOrAdmin: true },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-white/10 text-slate-300 h-screen sticky top-0 shrink-0 bg-[#070d1e]/85 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-falcon-600 via-cyan-500 to-amber-400 p-[1px] shadow-lg shadow-falcon-600/30">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-white">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base leading-tight tracking-wider flex items-center gap-1.5">
              FALCON
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-falcon-500/20 text-cyan-300 border border-falcon-500/30">
                CNC
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Exhibition CRM &amp; Sales</p>
          </div>
        </div>
      </div>

      {/* Prominent Quick Add Lead Button */}
      <div className="p-3">
        <button
          onClick={onOpenQuickAdd}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-falcon-600 via-cyan-500 to-falcon-500 hover:brightness-110 text-white font-bold text-sm shadow-[0_4px_20px_rgba(14,165,233,0.35)] border border-white/20 transition-all active:scale-[0.98] group"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>{t("nav_add_lead")}</span>
          <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded-md font-mono border border-white/10">
            &lt;60s
          </span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-1">
        {navItems.map((item) => {
          if (item.managerOrAdmin && !isManagerOrAdmin) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative",
                isActive
                  ? "bg-gradient-to-r from-falcon-600/20 to-transparent text-cyan-300 border-l-2 rtl:border-l-0 rtl:border-r-2 border-cyan-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-cyan-400" : "text-slate-400"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-[0_0_8px_#f43f5e] border border-white/20 animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-white/10 bg-black/30">
        <div className="flex items-center gap-3 p-1.5 rounded-xl glass-pill">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border border-slate-950" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold text-white truncate">
              {currentUser.full_name}
            </p>
            <p className="text-[10px] text-cyan-300/80 capitalize truncate font-mono">
              {currentUser.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
