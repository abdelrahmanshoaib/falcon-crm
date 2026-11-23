"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Lead, LeadActivity, UserProfile } from "@/types/crm";
import { TemperatureBadge } from "../common/Badges";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Flame, Trophy, Activity, Users, ArrowUpRight, Sparkles } from "lucide-react";
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
    { id: "new_lead", label: t("stage_new_lead"), count: leads.filter((l) => l.sales_stage === "new_lead").length, color: "from-slate-500 to-slate-400" },
    { id: "contacted", label: t("stage_contacted"), count: leads.filter((l) => l.sales_stage === "contacted").length, color: "from-blue-600 to-cyan-400" },
    { id: "qualified", label: t("stage_qualified"), count: leads.filter((l) => l.sales_stage === "qualified").length, color: "from-indigo-600 to-indigo-400" },
    { id: "consultation", label: t("stage_consultation"), count: leads.filter((l) => l.sales_stage === "consultation").length, color: "from-purple-600 to-purple-400" },
    { id: "quotation_sent", label: t("stage_quotation_sent"), count: leads.filter((l) => l.sales_stage === "quotation_sent").length, color: "from-amber-600 to-amber-400" },
    { id: "won", label: t("stage_won"), count: leads.filter((l) => l.sales_stage === "won").length, color: "from-emerald-600 to-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
      {/* 1. LEAD TEMPERATURE BREAKDOWN */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card space-y-4 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white">
              {t("lead_temperature_dist")}
            </h3>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            {leads.length} Leads
          </span>
        </div>

        {/* Visual Progress Bar with Glow */}
        <div className="w-full h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${hotPct}%` }}
            className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all shadow-[0_0_8px_rgba(244,63,94,0.6)]"
            title={`HOT: ${hotCount} (${hotPct}%)`}
          />
          <div
            style={{ width: `${warmPct}%` }}
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            title={`WARM: ${warmCount} (${warmPct}%)`}
          />
          <div
            style={{ width: `${coldPct}%` }}
            className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all"
            title={`COLD: ${coldCount} (${coldPct}%)`}
          />
        </div>

        {/* Detailed Breakdown Rows */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span className="font-semibold text-slate-200">HOT (70-100 pts)</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-white text-sm">{hotCount}</span>
              <span className="text-[11px] text-red-300/80">({hotPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <span className="font-semibold text-slate-200">WARM (40-69 pts)</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-white text-sm">{warmCount}</span>
              <span className="text-[11px] text-amber-300/80">({warmPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
              <span className="font-semibold text-slate-200">COLD (0-39 pts)</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-white text-sm">{coldCount}</span>
              <span className="text-[11px] text-cyan-300/80">({coldPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PIPELINE FUNNEL OVERVIEW */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card space-y-4 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
            {t("pipeline_funnel")}
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </h3>
          <Link
            href="/pipeline"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5 font-semibold"
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
                  <span className="font-mono text-cyan-300 font-semibold">
                    {stg.count} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(5, pct)}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${stg.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RECENT ACTIVITY TIMELINE */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card space-y-4 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white">
              {t("recent_activity")}
            </h3>
          </div>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto text-xs pr-1">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No recent activity recorded
            </div>
          ) : (
            activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 space-y-1 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                    {act.title}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {formatRelativeTime(act.created_at, language === "ar")}
                  </span>
                </div>
                {act.description && (
                  <p className="text-slate-400 text-[11px] line-clamp-1">{act.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
