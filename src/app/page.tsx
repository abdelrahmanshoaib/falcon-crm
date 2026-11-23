"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { Lead, FollowUp, Exhibition, LeadActivity, UserProfile } from "@/types/crm";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Calendar,
  Filter,
  Trophy,
  Users,
  Target,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { currentUser, currentRole } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  // Filters
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string>("all");
  const [selectedRepId, setSelectedRepId] = useState<string>("all");
  const [selectedTemp, setSelectedTemp] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      db.getLeads(),
      db.getFollowUps(),
      db.getExhibitions(),
      db.getProfiles(),
    ]).then(([leadsData, followUpsData, exhibitionsData, profilesData]) => {
      setLeads(leadsData);
      setFollowUps(followUpsData);
      setExhibitions(exhibitionsData);
      setProfiles(profilesData);

      if (leadsData.length > 0) {
        db.getLeadActivities(leadsData[0].id).then(setActivities);
      }
    });
  }, []);

  // Filter leads according to role & user selections
  const filteredLeads = leads.filter((lead) => {
    if (currentRole === "sales_rep") {
      const isMine =
        (lead.sales_owner_id && lead.sales_owner_id === currentUser.id) ||
        (lead.sales_owner_name && lead.sales_owner_name === currentUser.full_name);
      if (!isMine) return false;
    }
    if (selectedExhibitionId !== "all" && lead.exhibition_id !== selectedExhibitionId) {
      return false;
    }
    if (selectedRepId !== "all" && lead.sales_owner_id !== selectedRepId) {
      return false;
    }
    if (selectedTemp !== "all" && lead.temperature !== selectedTemp) {
      return false;
    }
    return true;
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const followupsToday = followUps.filter(
    (f) =>
      f.status === "pending" &&
      f.scheduled_at.startsWith(todayStr) &&
      (currentRole !== "sales_rep" || f.assigned_to === currentUser.id)
  ).length;

  const overdueFollowups = followUps.filter(
    (f) =>
      f.status === "pending" &&
      new Date(f.scheduled_at) < now &&
      (currentRole !== "sales_rep" || f.assigned_to === currentUser.id)
  ).length;

  const stats = {
    totalLeads: filteredLeads.length,
    newLeads: filteredLeads.filter((l) => l.sales_stage === "new_lead").length,
    hotLeads: filteredLeads.filter((l) => l.temperature === "HOT").length,
    followupsToday,
    overdueFollowups,
    qualifiedLeads: filteredLeads.filter(
      (l) => l.sales_stage !== "new_lead" && l.sales_stage !== "contacted"
    ).length,
    quotationsSent: filteredLeads.filter((l) => l.sales_stage === "quotation_sent").length,
    wonDeals: filteredLeads.filter((l) => l.sales_stage === "won").length,
  };

  const activeExhibition = exhibitions.find((e) => e.status === "active") || exhibitions[0];
  const targetLeads = activeExhibition?.target_leads || 150;
  const targetProgress = Math.min(100, Math.round((filteredLeads.length / targetLeads) * 100));

  const totalWonRevenue = filteredLeads
    .filter((l) => l.sales_stage === "won")
    .reduce((sum, l) => sum + (l.estimated_deal_value || 0), 0);

  const pipelineValue = filteredLeads
    .filter((l) => l.sales_stage !== "lost")
    .reduce((sum, l) => sum + (l.estimated_deal_value || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl glass-panel relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {t("nav_dashboard")}
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h1>
          </div>
          <p className="text-xs text-slate-300/80 mt-0.5">
            {currentRole === "sales_rep"
              ? `Personal Performance Cockpit — ${currentUser.full_name}`
              : "Company-Wide Machinery Sales Operations Cockpit"}
          </p>
        </div>

        {/* Global Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Exhibition Filter */}
          <select
            value={selectedExhibitionId}
            onChange={(e) => setSelectedExhibitionId(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all" className="bg-slate-900">{t("all")} Exhibitions</option>
            {exhibitions.map((ex) => (
              <option key={ex.id} value={ex.id} className="bg-slate-900">
                {ex.name}
              </option>
            ))}
          </select>

          {/* Rep Filter (For Admins & Managers) */}
          {currentRole !== "sales_rep" && (
            <select
              value={selectedRepId}
              onChange={(e) => setSelectedRepId(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
            >
              <option value="all" className="bg-slate-900">{t("all")} Sales Reps</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.full_name}
                </option>
              ))}
            </select>
          )}

          {/* Temperature Filter */}
          <select
            value={selectedTemp}
            onChange={(e) => setSelectedTemp(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all" className="bg-slate-900">{t("all")} Temps</option>
            <option value="HOT" className="bg-slate-900">HOT 🔥</option>
            <option value="WARM" className="bg-slate-900">WARM ☀️</option>
            <option value="COLD" className="bg-slate-900">COLD ❄️</option>
          </select>
        </div>
      </div>

      {/* 2. ACTIVE EXHIBITION HERO PROGRESS CARD */}
      {activeExhibition && (
        <div className="p-4 sm:p-5 rounded-2xl glass-card relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  LIVE EXHIBITION
                </span>
                <span className="text-xs text-slate-400">
                  {activeExhibition.location}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {activeExhibition.name}
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                {activeExhibition.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner">
                <span className="text-[10px] text-slate-400 block font-sans">
                  Target Progress
                </span>
                <span className="text-sm font-bold text-white">
                  {filteredLeads.length} / {targetLeads}{" "}
                  <span className="text-cyan-400">({targetProgress}%)</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 shadow-inner">
                <span className="text-[10px] text-slate-400 block font-sans">
                  Pipeline Value
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(pipelineValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Target Progress Bar */}
          <div className="mt-4 space-y-1">
            <div className="w-full h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
              <div
                style={{ width: `${targetProgress}%` }}
                className="h-full bg-gradient-to-r from-falcon-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(14,165,233,0.5)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. 8 KPI CARDS */}
      <KpiCards stats={stats} />

      {/* 4. VISUAL BREAKDOWN CHARTS & LIVE FEED */}
      <DashboardCharts
        leads={filteredLeads}
        activities={activities}
        profiles={profiles}
      />

      {/* 5. SALES TEAM LEADERBOARD (FOR ADMINS & MANAGERS) */}
      {currentRole !== "sales_rep" && (
        <div className="p-4 sm:p-5 rounded-2xl glass-card space-y-3 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">
                {t("team_performance")}
              </h3>
            </div>
            <Link
              href="/team"
              className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Manage Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-2 font-semibold">Sales Representative</th>
                  <th className="pb-2 font-semibold text-center">Leads Captured</th>
                  <th className="pb-2 font-semibold text-center">HOT Prospects</th>
                  <th className="pb-2 font-semibold text-center">Quotations</th>
                  <th className="pb-2 font-semibold text-center">Won Deals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles
                  .filter((p) => p.role === "sales_rep" || p.role === "manager")
                  .map((rep) => {
                    const repLeads = leads.filter((l) => l.sales_owner_id === rep.id);
                    const repHot = repLeads.filter((l) => l.temperature === "HOT").length;
                    const repQuotes = repLeads.filter((l) => l.sales_stage === "quotation_sent").length;
                    const repWon = repLeads.filter((l) => l.sales_stage === "won").length;

                    return (
                      <tr key={rep.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-2.5 flex items-center gap-2.5 font-semibold text-white">
                          <img
                            src={rep.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                            alt={rep.full_name}
                            className="w-7 h-7 rounded-full object-cover border border-cyan-500/30"
                          />
                          <span>{rep.full_name}</span>
                        </td>
                        <td className="py-2.5 text-center font-mono font-bold text-slate-200">
                          {repLeads.length}
                        </td>
                        <td className="py-2.5 text-center font-mono font-bold text-red-400">
                          {repHot}
                        </td>
                        <td className="py-2.5 text-center font-mono font-bold text-amber-400">
                          {repQuotes}
                        </td>
                        <td className="py-2.5 text-center font-mono font-bold text-emerald-400">
                          {repWon}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
