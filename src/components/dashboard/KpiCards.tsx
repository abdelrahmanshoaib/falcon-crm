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
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      filterUrl: "/leads",
    },
    {
      id: "new",
      label: t("kpi_new_leads"),
      value: stats.newLeads,
      icon: UserPlus,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      filterUrl: "/leads?stage=new_lead",
    },
    {
      id: "hot",
      label: t("kpi_hot_leads"),
      value: stats.hotLeads,
      icon: Flame,
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      filterUrl: "/leads?temp=HOT",
      badge: "Priority",
    },
    {
      id: "overdue",
      label: t("kpi_overdue_followups"),
      value: stats.overdueFollowups,
      icon: AlertCircle,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      filterUrl: "/followups?view=overdue",
      highlight: stats.overdueFollowups > 0,
    },
    {
      id: "today_followups",
      label: t("kpi_followups_today"),
      value: stats.followupsToday,
      icon: CalendarCheck,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      filterUrl: "/followups?view=today",
    },
    {
      id: "qualified",
      label: t("kpi_qualified_leads"),
      value: stats.qualifiedLeads,
      icon: Award,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      filterUrl: "/leads?stage=qualified",
    },
    {
      id: "quotes",
      label: t("kpi_quotations_sent"),
      value: stats.quotationsSent,
      icon: FileCheck,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      filterUrl: "/pipeline?stage=quotation_sent",
    },
    {
      id: "won",
      label: t("kpi_won_deals"),
      value: stats.wonDeals,
      icon: Trophy,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      filterUrl: "/pipeline?stage=won",
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
            className={`p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between group ${
              card.highlight ? "ring-1 ring-rose-500/40 bg-rose-950/10" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium line-clamp-1">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4 shrink-0" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <span className="text-xl sm:text-2xl font-black text-white font-mono group-hover:text-falcon-400 transition-colors">
                {card.value}
              </span>
              {card.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
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
