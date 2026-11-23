"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { Lead, Exhibition, UserProfile } from "@/types/crm";
import { PipelineKanban } from "@/components/pipeline/PipelineKanban";
import { LeadProfileModal } from "@/components/leads/LeadProfileModal";
import { GitPullRequest, Filter, Building2, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PipelinePage() {
  const { t } = useLanguage();
  const { currentUser, currentRole } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  // Filter
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string>("all");
  const [selectedRepId, setSelectedRepId] = useState<string>("all");

  // Profile Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    Promise.all([db.getLeads(), db.getExhibitions(), db.getProfiles()]).then(
      ([leadsData, exData, profData]) => {
        setLeads(leadsData);
        setExhibitions(exData);
        setProfiles(profData);
      }
    );
  }, []);

  const filteredLeads = leads.filter((l) => {
    if (currentRole === "sales_rep") {
      const isMine =
        (l.sales_owner_id && l.sales_owner_id === currentUser.id) ||
        (l.sales_owner_name && l.sales_owner_name === currentUser.full_name);
      if (!isMine) return false;
    }
    if (selectedExhibitionId !== "all" && l.exhibition_id !== selectedExhibitionId) {
      return false;
    }
    if (selectedRepId !== "all" && l.sales_owner_id !== selectedRepId) {
      return false;
    }
    return true;
  });

  const totalPipelineValue = filteredLeads
    .filter((l) => l.sales_stage !== "lost")
    .reduce((sum, l) => sum + (l.estimated_deal_value || 0), 0);

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-6rem)]">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("nav_pipeline")}
            </h1>
            {currentRole === "sales_rep" && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                صفقاتك فقط ({filteredLeads.length})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300/80 mt-0.5">
            {currentRole === "sales_rep"
              ? "إدارة صفقاتك وعروض أسعارك الخاصة في خط سير المبيعات"
              : "Drag deals between stages. Record required closing dates, values, or lost reasons."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs">
            <span className="text-slate-400">Total Value: </span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(totalPipelineValue)}
            </span>
          </div>

          {/* Exhibition Filter */}
          <select
            value={selectedExhibitionId}
            onChange={(e) => setSelectedExhibitionId(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all" className="bg-slate-900">All Exhibitions</option>
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
              className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all" className="bg-slate-900">All Sales Reps</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.full_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PipelineKanban
          leads={filteredLeads}
          onLeadUpdated={(updated) => {
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          }}
          onOpenLeadProfile={(l) => setSelectedLead(l)}
        />
      </div>

      {/* LEAD PROFILE MODAL */}
      <LeadProfileModal
        leadId={selectedLead?.id || null}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        }}
      />
    </div>
  );
}
