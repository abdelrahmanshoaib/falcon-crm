"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import {
  Lead,
  LeadNote,
  LeadActivity,
  SalesStage,
  LeadTemperature,
  PurchaseTimeline,
  PurchaseIntent,
  BudgetStatus,
  FactoryStatus,
  DecisionRole,
} from "@/types/crm";
import {
  X,
  Phone,
  MessageCircle,
  CalendarPlus,
  QrCode,
  Building,
  User,
  MapPin,
  Mail,
  Briefcase,
  Flame,
  Award,
  Clock,
  Send,
  FileCheck,
  CheckCircle,
  XCircle,
  ChevronRight,
  Info,
} from "lucide-react";
import { TemperatureBadge, StageBadge } from "../common/Badges";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface LeadProfileModalProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated?: (lead: Lead) => void;
  onOpenFollowUp?: (lead: Lead) => void;
  onOpenQR?: (lead: Lead) => void;
}

export function LeadProfileModal({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated,
  onOpenFollowUp,
  onOpenQR,
}: LeadProfileModalProps) {
  const { t, language } = useLanguage();
  const { currentUser, can } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "qualification" | "notes" | "timeline">("overview");

  // New Note
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Score inspector modal
  const [showScoreInspector, setShowScoreInspector] = useState(false);

  useEffect(() => {
    if (leadId && isOpen) {
      db.getLeadById(leadId).then(setLead);
      db.getLeadNotes(leadId).then(setNotes);
      db.getLeadActivities(leadId).then(setActivities);
    }
  }, [leadId, isOpen]);

  if (!isOpen || !lead) return null;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    const added = await db.addNote({
      lead_id: lead.id,
      author_name: currentUser.full_name,
      note: newNote.trim(),
    });
    setNotes([added, ...notes]);
    setNewNote("");
    setIsAddingNote(false);
  };

  const handleUpdateQualification = async (updates: Partial<Lead>) => {
    const updated = await db.updateLead(lead.id, updates, currentUser.full_name);
    if (updated) {
      setLead(updated);
      if (onLeadUpdated) onLeadUpdated(updated);
    }
  };

  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="glass-modal rounded-[28px] w-full max-w-3xl text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-auto flex flex-col max-h-[92vh] border border-white/20 relative animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-falcon-600 via-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-falcon-600/25 shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-cyan-300 font-extrabold text-lg font-mono">
                {lead.full_name.charAt(0)}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {lead.full_name}
                </h2>
                <TemperatureBadge
                  temperature={lead.temperature}
                  score={lead.lead_score}
                  onClick={() => setShowScoreInspector(true)}
                />
                <StageBadge stage={lead.sales_stage} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                {lead.company_name && (
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {lead.company_name}
                  </span>
                )}
                {lead.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {lead.city}
                  </span>
                )}
                <span className="text-slate-500">•</span>
                <span>{lead.exhibition_name || "Cairo WoodShow"}</span>
                <span className="text-slate-500">•</span>
                <span>Owner: {lead.sales_owner_name || "Sales Rep"}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Call, WhatsApp, Schedule Follow-up, Generate QR) */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {lead.phone && (
              <>
                <a
                  href={`tel:${lead.phone}`}
                  className="p-2.5 rounded-xl glass-pill text-blue-400 hover:text-white transition-all active:scale-95"
                  title={t("call")}
                >
                  <Phone className="w-4 h-4" />
                </a>

                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all active:scale-95 shadow-sm"
                  title={t("whatsapp")}
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </>
            )}

            <button
              onClick={() => {
                if (onOpenFollowUp) onOpenFollowUp(lead);
              }}
              className="p-2.5 rounded-xl glass-pill text-amber-400 hover:text-white transition-all active:scale-95"
              title={t("schedule_followup")}
            >
              <CalendarPlus className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (onOpenQR) onOpenQR(lead);
              }}
              className="p-2.5 rounded-xl glass-pill text-cyan-400 hover:text-white transition-all active:scale-95"
              title={t("generate_qr")}
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl glass-pill text-slate-400 hover:text-white transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TABS BAR */}
        <div className="flex border-b border-white/10 bg-white/[0.01] px-4 gap-4 overflow-x-auto text-xs">
          {[
            { id: "overview", label: t("tab_overview") },
            { id: "qualification", label: t("tab_qualification") },
            { id: "notes", label: `${t("tab_notes")} (${notes.length})` },
            { id: "timeline", label: `${t("tab_activity")} (${activities.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB PANELS */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Financial & Machine Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">
                    Interested CNC Machinery
                  </span>
                  <span className="text-sm font-bold text-falcon-400 mt-1 block">
                    {lead.interested_machine_names?.[0] || "Custom Inquiry"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">
                    Estimated Deal Value
                  </span>
                  <span className="text-sm font-bold text-emerald-400 mt-1 block">
                    {lead.estimated_deal_value
                      ? formatCurrency(lead.estimated_deal_value)
                      : "Pending Quote"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      Qualification Score
                    </span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {lead.lead_score} / 100
                    </span>
                  </div>
                  <button
                    onClick={() => setShowScoreInspector(true)}
                    className="text-xs text-falcon-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>View breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contact & Company Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                    Contact Information
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-mono text-white font-semibold">
                      {lead.phone}
                    </span>
                  </div>
                  {lead.email && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white">{lead.email}</span>
                    </div>
                  )}
                  {lead.job_title && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Job Title:</span>
                      <span className="text-white">{lead.job_title}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">City / Industrial Zone:</span>
                    <span className="text-white">{lead.city || "Cairo"}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                    Company & Infrastructure
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Business Sector:</span>
                    <span className="text-white font-medium">
                      {lead.business_sector || "Furniture & Wood"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Factory Status:</span>
                    <span className="text-white capitalize">
                      {lead.factory_status?.replace("_", " ") || "Operational"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Owns CNC Machinery:</span>
                    <span className="text-white">
                      {lead.owns_cnc ? "Yes" : "No (First Machine)"}
                    </span>
                  </div>
                  {lead.current_machines && (
                    <div className="pt-1 border-t border-slate-800">
                      <span className="text-slate-400 block mb-0.5">
                        Current Machines:
                      </span>
                      <span className="text-slate-300 italic">
                        {lead.current_machines}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Initial Booth Notes */}
              {lead.notes && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <h4 className="font-bold text-slate-300 mb-1">
                    Exhibition Booth Notes:
                  </h4>
                  <p className="text-slate-200 leading-relaxed">{lead.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* 2. QUALIFICATION TAB */}
          {activeTab === "qualification" && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-falcon-950/40 border border-falcon-800/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-falcon-300">
                    Lead Qualification Score: {lead.lead_score}/100 ({lead.temperature})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Changes made here automatically recalculate the lead score and temperature.
                  </p>
                </div>
                <TemperatureBadge
                  temperature={lead.temperature}
                  score={lead.lead_score}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Purchase Timeline */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-300">
                    {t("q_purchase_timeline")}
                  </label>
                  <select
                    value={lead.purchase_timeline || "1_3_months"}
                    onChange={(e) =>
                      handleUpdateQualification({
                        purchase_timeline: e.target.value as PurchaseTimeline,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="within_30_days">{t("q_timeline_30d")}</option>
                    <option value="1_3_months">{t("q_timeline_1_3m")}</option>
                    <option value="3_6_months">{t("q_timeline_3_6m")}</option>
                    <option value="6_12_months">{t("q_timeline_6_12m")}</option>
                    <option value="unknown">{t("q_timeline_unknown")}</option>
                  </select>
                </div>

                {/* Purchase Intent */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-300">
                    {t("q_purchase_intent")}
                  </label>
                  <select
                    value={lead.purchase_intent || "comparing_options"}
                    onChange={(e) =>
                      handleUpdateQualification({
                        purchase_intent: e.target.value as PurchaseIntent,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="ready_to_buy">{t("q_intent_ready")}</option>
                    <option value="comparing_options">{t("q_intent_comparing")}</option>
                    <option value="planning_future">{t("q_intent_future")}</option>
                    <option value="general_interest">{t("q_intent_general")}</option>
                  </select>
                </div>

                {/* Budget Status */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-300">
                    {t("q_budget_status")}
                  </label>
                  <select
                    value={lead.budget_status || "budget_available"}
                    onChange={(e) =>
                      handleUpdateQualification({
                        budget_status: e.target.value as BudgetStatus,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="budget_available">{t("q_budget_available")}</option>
                    <option value="financing_needed">{t("q_budget_financing")}</option>
                    <option value="budget_not_defined">{t("q_budget_undefined")}</option>
                    <option value="not_discussed">{t("q_budget_not_discussed")}</option>
                  </select>
                </div>

                {/* Decision Role */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-300">
                    {t("q_decision_authority")}
                  </label>
                  <select
                    value={lead.decision_role || "owner"}
                    onChange={(e) =>
                      handleUpdateQualification({
                        decision_role: e.target.value as DecisionRole,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="owner">{t("q_owner")}</option>
                    <option value="decision_maker">{t("q_decision_maker")}</option>
                    <option value="purchasing_manager">{t("q_purchasing")}</option>
                    <option value="technical_evaluator">{t("q_technical")}</option>
                    <option value="influencer">{t("q_influencer")}</option>
                  </select>
                </div>

                {/* Factory Infrastructure */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-slate-300">
                    {t("q_factory_status")}
                  </label>
                  <select
                    value={lead.factory_status || "yes"}
                    onChange={(e) =>
                      handleUpdateQualification({
                        factory_status: e.target.value as FactoryStatus,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="yes">{t("q_factory_yes")}</option>
                    <option value="under_construction">{t("q_factory_construction")}</option>
                    <option value="planning">{t("q_factory_planning")}</option>
                    <option value="no">{t("q_factory_no")}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. NOTES TAB */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record interaction notes, objection handling, machine specifications..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-falcon-500 placeholder-slate-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-falcon-600 hover:bg-falcon-500 text-white font-semibold text-xs disabled:opacity-50 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t("add_note")}</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-2.5">
                {notes.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    No notes recorded yet.
                  </p>
                ) : (
                  notes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-falcon-400">
                          {n.author_name}
                        </span>
                        <span>{formatRelativeTime(n.created_at, language === "ar")}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {n.note}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. ACTIVITY TIMELINE TAB */}
          {activeTab === "timeline" && (
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  No activity history found.
                </p>
              ) : (
                <div className="relative border-l-2 border-slate-800 rtl:border-l-0 rtl:border-r-2 ml-3 rtl:ml-0 rtl:mr-3 space-y-4 py-1">
                  {activities.map((act) => (
                    <div key={act.id} className="relative pl-6 rtl:pl-0 rtl:pr-6">
                      <div className="absolute -left-1.5 rtl:-left-auto rtl:-right-1.5 top-1 w-3 h-3 rounded-full bg-falcon-500 ring-4 ring-slate-900" />
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-bold text-white capitalize">
                            {act.title}
                          </span>
                          <span>
                            {formatRelativeTime(act.created_at, language === "ar")}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-slate-300 leading-relaxed">
                            {act.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Lead ID: <span className="font-mono text-slate-300">{lead.id}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            {t("close")}
          </button>
        </div>
      </div>

      {/* WHY THIS SCORE WAS ASSIGNED (SCORING BREAKDOWN INSPECTOR) */}
      {showScoreInspector && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">{t("why_score_assigned")}</h3>
              </div>
              <button
                onClick={() => setShowScoreInspector(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Calculated Score</span>
                <span className="text-xl font-bold text-white block">
                  {lead.lead_score} / 100
                </span>
              </div>
              <TemperatureBadge
                temperature={lead.temperature}
                score={lead.lead_score}
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lead.scoring_breakdown && lead.scoring_breakdown.length > 0 ? (
                lead.scoring_breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        {item.criterion}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.reason}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        item.points > 0
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      +{item.points}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">
                  Standard criteria applied: Timeline (+25), Intent (+15), Budget (+15), Machine (+10).
                </div>
              )}
            </div>

            <button
              onClick={() => setShowScoreInspector(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              {t("done")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
