"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Lead, LeadActivity, UserProfile } from "@/types/crm";
import { TemperatureBadge } from "../common/Badges";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Flame, Trophy, Activity, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface DashboardChartsProps {
  leads: Lead[];
  activities: LeadActivity[];
  profiles: UserProfile[];
}

export function DashboardCharts({
  leads,
  activities,
  profiles,
}: DashboardChartsProps) {
  const { t, language } = useLanguage();

  // Temperature calculations
  const total = leads.length || 1;
  const hotCount = leads.filter((l) => l.temperature === "HOT").length;
  const warmCount = leads.filter((l) => l.temperature === "WARM").length;
  const coldCount = leads.filter((l) => l.temperature === "COLD").length;

  const hotPct = Math.round((hotCount / total) * 100);
  const warmPct = Math.round((warmCount / total) * 100);
  const coldPct = Math.round((coldCount / total) * 100);

  // Pipeline stage counts
  const stages = [
    { id: "new_lead", label: t("stage_new_lead"), count: leads.filter((l) => l.sales_stage === "new_lead").length, color: "bg-slate-400" },
    { id: "contacted", label: t("stage_contacted"), count: leads.filter((l) => l.sales_stage === "contacted").length, color: "bg-blue-400" },
    { id: "qualified", label: t("stage_qualified"), count: leads.filter((l) => l.sales_stage === "qualified").length, color: "bg-indigo-400" },
    { id: "consultation", label: t("stage_consultation"), count: leads.filter((l) => l.sales_stage === "consultation").length, color: "bg-purple-400" },
    { id: "quotation_sent", label: t("stage_quotation_sent"), count: leads.filter((l) => l.sales_stage === "quotation_sent").length, color: "bg-amber-400" },
    { id: "won", label: t("stage_won"), count: leads.filter((l) => l.sales_stage === "won").length, color: "bg-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. LEAD TEMPERATURE BREAKDOWN */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-400" />
            <h3 className="font-bold text-xs sm:text-sm text-white">
              {t("lead_temperature_dist")}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {leads.length} Leads
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${hotPct}%` }}
            className="bg-red-500 h-full transition-all"
            title={`HOT: ${hotCount} (${hotPct}%)`}
          />
          <div
            style={{ width: `${warmPct}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`WARM: ${warmCount} (${warmPct}%)`}
          />
          <div
            style={{ width: `${coldPct}%` }}
            className="bg-blue-500 h-full transition-all"
            title={`COLD: ${coldCount} (${coldPct}%)`}
          />
        </div>

        {/* Detailed Breakdown Rows */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="font-semibold text-slate-200">HOT (70-100 pts)</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-white">{hotCount}</span>
              <span className="text-[11px] text-slate-400">({hotPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-semibold text-slate-200">WARM (40-69 pts)</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-white">{warmCount}</span>
              <span className="text-[11px] text-slate-400">({warmPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-semibold text-slate-200">COLD (0-39 pts)</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-white">{coldCount}</span>
              <span className="text-[11px] text-slate-400">({coldPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PIPELINE FUNNEL OVERVIEW */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-white">
            {t("pipeline_funnel")}
          </h3>
          <Link
            href="/pipeline"
            className="text-[11px] text-falcon-400 hover:underline flex items-center gap-0.5"
          >
            <span>View Board</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2.5 text-xs">
          {stages.map((stg) => {
            const pct = Math.round((stg.count / total) * 100);
            return (
              <div key={stg.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{stg.label}</span>
                  <span className="font-mono text-slate-400 font-semibold">
                    {stg.count} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(5, pct)}%` }}
                    className={`h-full rounded-full ${stg.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RECENT ACTIVITY TIMELINE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs sm:text-sm text-white">
              {t("recent_activity")}
            </h3>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto text-xs">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              No recent activity recorded
            </div>
          ) : (
            activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-white truncate max-w-[170px]">
                    {act.title}
                  </span>
                  <span>{formatRelativeTime(act.created_at, language === "ar")}</span>
                </div>
                {act.description && (
                  <p className="text-slate-400 line-clamp-1">{act.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
