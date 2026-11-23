"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import { Exhibition, Lead } from "@/types/crm";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Calendar,
  MapPin,
  Target,
  Trophy,
  Users,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function ExhibitionsPage() {
  const { t } = useLanguage();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedExId, setSelectedExId] = useState<string>("");

  useEffect(() => {
    Promise.all([db.getExhibitions(), db.getLeads()]).then(([exData, leadsData]) => {
      setExhibitions(exData);
      setLeads(leadsData);
      if (exData.length > 0) setSelectedExId(exData[0].id);
    });
  }, []);

  const activeExhibition = exhibitions.find((e) => e.id === selectedExId) || exhibitions[0];
  const exLeads = leads.filter((l) => l.exhibition_id === activeExhibition?.id);

  // Metrics for active exhibition
  const hotLeads = exLeads.filter((l) => l.temperature === "HOT").length;
  const warmLeads = exLeads.filter((l) => l.temperature === "WARM").length;
  const coldLeads = exLeads.filter((l) => l.temperature === "COLD").length;
  const qualified = exLeads.filter(
    (l) => l.sales_stage !== "new_lead" && l.sales_stage !== "contacted"
  ).length;
  const quotes = exLeads.filter((l) => l.sales_stage === "quotation_sent").length;
  const won = exLeads.filter((l) => l.sales_stage === "won").length;

  const expectedRevenue = exLeads.reduce(
    (sum, l) => sum + (l.estimated_deal_value || 0),
    0
  );
  const realizedRevenue = exLeads
    .filter((l) => l.sales_stage === "won")
    .reduce((sum, l) => sum + (l.estimated_deal_value || 0), 0);

  const targetLeads = activeExhibition?.target_leads || 150;
  const progressPct = Math.min(100, Math.round((exLeads.length / targetLeads) * 100));
  const conversionRate = exLeads.length > 0 ? Math.round((won / exLeads.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-falcon-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("exhibition_mgmt")}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor machinery exhibition targets, expected ROI, and visitor conversion rates.
          </p>
        </div>

        {/* Exhibition Switcher */}
        <select
          value={selectedExId}
          onChange={(e) => setSelectedExId(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          {exhibitions.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({ex.status})
            </option>
          ))}
        </select>
      </div>

      {activeExhibition && (
        <>
          {/* 2. EXHIBITION PERFORMANCE COCKPIT */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    {activeExhibition.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {activeExhibition.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {activeExhibition.location}
                  </span>
                  <span>•</span>
                  <span>
                    {activeExhibition.start_date} to {activeExhibition.end_date}
                  </span>
                </div>
              </div>

              <div className="font-mono text-xs text-right rtl:text-left">
                <span className="text-slate-400 block text-[11px]">
                  Target Acquisition
                </span>
                <span className="text-base font-bold text-white">
                  {exLeads.length} / {targetLeads} Leads ({progressPct}%)
                </span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full bg-gradient-to-r from-falcon-600 to-emerald-500 rounded-full transition-all duration-500"
              />
            </div>

            {/* KPI METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Captured</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">
                  {exLeads.length}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">HOT Prospects</span>
                <span className="text-xl font-bold text-red-400 font-mono mt-1 block">
                  {hotLeads}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  Expected Deal Value
                </span>
                <span className="text-xl font-bold text-falcon-400 font-mono mt-1 block">
                  {formatCurrency(expectedRevenue)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  Realized Revenue (Won)
                </span>
                <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
                  {formatCurrency(realizedRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. TEMPERATURE & CONVERSION INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400">
                Lead Temperature Split
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-red-400">HOT Leads (70-100 pts):</span>
                  <span className="font-bold text-white">{hotLeads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400">WARM Leads (40-69 pts):</span>
                  <span className="font-bold text-white">{warmLeads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">COLD Leads (0-39 pts):</span>
                  <span className="font-bold text-white">{coldLeads}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400">
                Conversion Funnel
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-300">Qualified Prospects:</span>
                  <span className="font-bold text-white">{qualified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400">Formal Quotations:</span>
                  <span className="font-bold text-white">{quotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Deals Won:</span>
                  <span className="font-bold text-white">{won}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-400">
                  Visitor Conversion Rate
                </h3>
                <span className="text-3xl font-black text-white font-mono mt-2 block">
                  {conversionRate}%
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Percentage of exhibition contacts converted to confirmed closed sales.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
