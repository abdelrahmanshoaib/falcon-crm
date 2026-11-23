"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  UserPlus,
  Flame,
  CalendarCheck,
  AlertCircle,
  Award,
  FileCheck,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface KpiCardsProps {
  stats: {
    totalLeads: number;
    newLeads: number;
    hotLeads: number;
    followupsToday: number;
    overdueFollowups: number;
    qualifiedLeads: number;
    quotationsSent: number;
    wonDeals: number;
  };
}

export function KpiCards({ stats }: KpiCardsProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const cards = [
    {
      id: "total",
      label: t("kpi_total_leads"),
      value: stats.totalLeads,
      icon: Users,
      iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      accentGlow: "group-hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]",
      filterUrl: "/leads",
    },
    {
      id: "new",
      label: t("kpi_new_leads"),
      value: stats.newLeads,
      icon: UserPlus,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      accentGlow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      filterUrl: "/leads?stage=new_lead",
    },
    {
      id: "hot",
      label: t("kpi_hot_leads"),
      value: stats.hotLeads,
      icon: Flame,
      iconColor: "text-red-400 bg-red-500/15 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.35)]",
      accentGlow: "group-hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]",
      filterUrl: "/leads?temp=HOT",
      badge: "Priority",
    },
    {
      id: "overdue",
      label: t("kpi_overdue_followups"),
      value: stats.overdueFollowups,
      icon: AlertCircle,
      iconColor: "text-rose-400 bg-rose-500/15 border-rose-500/40",
      accentGlow: "group-hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]",
      filterUrl: "/followups?view=overdue",
      highlight: stats.overdueFollowups > 0,
    },
    {
      id: "today_followups",
      label: t("kpi_followups_today"),
      value: stats.followupsToday,
      icon: CalendarCheck,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      accentGlow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
      filterUrl: "/followups?view=today",
    },
    {
      id: "qualified",
      label: t("kpi_qualified_leads"),
      value: stats.qualifiedLeads,
      icon: Award,
      iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
      accentGlow: "group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]",
      filterUrl: "/leads?stage=qualified",
    },
    {
      id: "quotes",
      label: t("kpi_quotations_sent"),
      value: stats.quotationsSent,
      icon: FileCheck,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      accentGlow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      filterUrl: "/pipeline?stage=quotation_sent",
    },
    {
      id: "won",
      label: t("kpi_won_deals"),
      value: stats.wonDeals,
      icon: Trophy,
      iconColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.35)]",
      accentGlow: "group-hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
      filterUrl: "/pipeline?stage=won",
      badge: "Deals",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => router.push(card.filterUrl)}
            className={`p-3.5 sm:p-4 rounded-2xl glass-card glass-card-hover cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
              card.highlight
                ? "ring-1 ring-rose-500/50 bg-gradient-to-b from-rose-950/20 to-slate-950/80 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                : ""
            } ${card.accentGlow}`}
          >
            {/* Specular Edge Highlight */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs text-slate-400 font-semibold line-clamp-1 group-hover:text-slate-200 transition-colors">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconColor} transition-transform group-hover:scale-110 duration-200 shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <span className="text-xl sm:text-2xl font-black text-white font-mono group-hover:text-cyan-300 transition-colors tracking-tight">
                {card.value}
              </span>
              {card.badge && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-amber-300 border border-amber-400/30">
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
