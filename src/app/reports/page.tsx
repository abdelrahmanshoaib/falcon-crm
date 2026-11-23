"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { Lead, FollowUp, Exhibition, SalesMagnet } from "@/types/crm";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  Download,
  Filter,
  Flame,
  Trophy,
  Users,
  Target,
  FileSpreadsheet,
  Building,
} from "lucide-react";

export default function ReportsPage() {
  const { t } = useLanguage();
  const { can, currentRole } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [magnets, setMagnets] = useState<SalesMagnet[]>([]);

  useEffect(() => {
    Promise.all([
      db.getLeads(),
      db.getFollowUps(),
      db.getExhibitions(),
      db.getSalesMagnets(),
    ]).then(([leadsData, fuData, exData, magData]) => {
      setLeads(leadsData);
      setFollowUps(fuData);
      setExhibitions(exData);
      setMagnets(magData);
    });
  }, []);

  // Aggregations
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.sales_stage === "won");
  const wonRevenue = wonLeads.reduce((s, l) => s + (l.estimated_deal_value || 0), 0);
  const pipelineValue = leads
    .filter((l) => l.sales_stage !== "lost")
    .reduce((s, l) => s + (l.estimated_deal_value || 0), 0);

  // Group by City
  const cityCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const city = l.city || "Cairo";
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  // Group by Machine Category
  const machineCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const machine = l.interested_machine_names?.[0] || "Custom CNC";
    machineCounts[machine] = (machineCounts[machine] || 0) + 1;
  });

  // Follow-up completion stats
  const completedFollowUps = followUps.filter((f) => f.status === "completed").length;
  const completionRate =
    followUps.length > 0 ? Math.round((completedFollowUps / followUps.length) * 100) : 0;

  const handleExportCSV = () => {
    const headers = [
      "Customer",
      "Company",
      "Phone",
      "City",
      "Machine",
      "Score",
      "Temperature",
      "Stage",
      "Value",
      "Owner",
      "Exhibition",
    ];
    const rows = leads.map((l) => [
      `"${l.full_name}"`,
      `"${l.company_name || ""}"`,
      `"${l.phone}"`,
      `"${l.city || ""}"`,
      `"${l.interested_machine_names?.[0] || ""}"`,
      l.lead_score,
      l.temperature,
      l.sales_stage,
      l.estimated_deal_value || 0,
      `"${l.sales_owner_name || ""}"`,
      `"${l.exhibition_name || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `falcon_crm_executive_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-falcon-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("nav_reports")}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Executive machinery exhibition analytics, lead attribution, and pipeline velocity.
          </p>
        </div>

        {can("view_all_leads") && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-falcon-600 hover:bg-falcon-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Executive CSV Report</span>
          </button>
        )}
      </div>

      {/* 2. EXECUTIVE SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Total Pipeline Value</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
            {formatCurrency(pipelineValue)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Realized Revenue (Won)</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">
            {formatCurrency(wonRevenue)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Total Exhibition Leads</span>
          <span className="text-xl font-bold text-falcon-400 font-mono mt-1 block">
            {totalLeads}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Follow-up Completion</span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">
            {completionRate}%
          </span>
        </div>
      </div>

      {/* 3. MACHINE DEMAND & CITY DISTRIBUTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Machine Demand */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white">
            CNC Machinery Model Demand
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(machineCounts).map(([model, count]) => {
              const pct = Math.round((count / (totalLeads || 1)) * 100);
              return (
                <div key={model} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{model}</span>
                    <span className="font-mono text-falcon-400 font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-falcon-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Industrial Hubs / Cities */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white">
            Lead Distribution by Industrial Zone
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(cityCounts).map(([cityName, count]) => {
              const pct = Math.round((count / (totalLeads || 1)) * 100);
              return (
                <div key={cityName} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{cityName}</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. SALES MAGNET ENGAGEMENT STATS */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white">
          Sales Magnet Performance & Content Engagement
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="pb-2 font-medium">Resource Title</th>
                <th className="pb-2 font-medium">Format</th>
                <th className="pb-2 font-medium text-center">Downloads</th>
                <th className="pb-2 font-medium text-center">Shares</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {magnets.map((mag) => (
                <tr key={mag.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 font-sans font-semibold text-white">
                    {mag.title}
                  </td>
                  <td className="py-2.5 uppercase text-slate-400 text-[10px]">
                    {mag.content_type}
                  </td>
                  <td className="py-2.5 text-center text-falcon-400 font-bold">
                    {mag.downloads_count}
                  </td>
                  <td className="py-2.5 text-center text-emerald-400 font-bold">
                    {mag.shares_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
