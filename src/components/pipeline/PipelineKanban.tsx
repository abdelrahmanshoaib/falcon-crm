"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { Lead, SalesStage, LeadTemperature } from "@/types/crm";
import { TemperatureBadge } from "../common/Badges";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  Building,
  Calendar,
  DollarSign,
  User,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  X,
  Trophy,
} from "lucide-react";

interface PipelineKanbanProps {
  leads: Lead[];
  onLeadUpdated: (lead: Lead) => void;
  onOpenLeadProfile: (lead: Lead) => void;
}

const STAGES: SalesStage[] = [
  "new_lead",
  "contacted",
  "qualified",
  "consultation",
  "quotation_sent",
  "negotiation",
  "won",
  "lost",
  "on_hold",
];

export function PipelineKanban({
  leads,
  onLeadUpdated,
  onOpenLeadProfile,
}: PipelineKanbanProps) {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();

  // Dragging state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Won Modal State
  const [wonModalLead, setWonModalLead] = useState<Lead | null>(null);
  const [wonDealValue, setWonDealValue] = useState<number>(0);
  const [wonMachine, setWonMachine] = useState<string>("");
  const [wonNotes, setWonNotes] = useState<string>("");

  // Lost Modal State
  const [lostModalLead, setLostModalLead] = useState<Lead | null>(null);
  const [lostReason, setLostReason] = useState<string>("price");
  const [lostNotes, setLostNotes] = useState<string>("");

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: SalesStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (!id) return;

    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.sales_stage === targetStage) return;

    // Strict Pipeline Rules check:
    if (targetStage === "won") {
      setWonModalLead(lead);
      setWonDealValue(lead.estimated_deal_value || 25000);
      setWonMachine(lead.interested_machine_names?.[0] || "Falcon ATC-Master 2030");
      setDraggedLeadId(null);
      return;
    }

    if (targetStage === "lost") {
      setLostModalLead(lead);
      setDraggedLeadId(null);
      return;
    }

    // Direct transition for other stages
    const updated = await db.updateLeadStage(id, targetStage, undefined, currentUser.full_name);
    if (updated) onLeadUpdated(updated);
    setDraggedLeadId(null);
  };

  const handleConfirmWon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wonModalLead) return;

    const updated = await db.updateLeadStage(
      wonModalLead.id,
      "won",
      {
        deal_value: Number(wonDealValue),
        machine_sold: wonMachine,
        notes: wonNotes,
      },
      currentUser.full_name
    );

    if (updated) {
      onLeadUpdated(updated);
      // Confetti celebration blast!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
    setWonModalLead(null);
  };

  const handleConfirmLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostModalLead) return;

    const updated = await db.updateLeadStage(
      lostModalLead.id,
      "lost",
      {
        lost_reason: lostReason,
        lost_notes: lostNotes,
      },
      currentUser.full_name
    );

    if (updated) onLeadUpdated(updated);
    setLostModalLead(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 pt-1 h-full select-none">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.sales_stage === stage);
        const stageValue = stageLeads.reduce(
          (sum, l) => sum + (l.estimated_deal_value || 0),
          0
        );
        const stageKey = `stage_${stage}` as keyof typeof import("@/lib/i18n").translations.en;

        const isWon = stage === "won";
        const isLost = stage === "lost";

        return (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
            className={`w-72 shrink-0 rounded-2xl border flex flex-col max-h-[calc(100vh-12rem)] transition-colors ${
              isWon
                ? "bg-emerald-950/20 border-emerald-800/40"
                : isLost
                ? "bg-rose-950/20 border-rose-800/40"
                : "bg-slate-900/60 border-slate-800"
            }`}
          >
            {/* COLUMN HEADER */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">
                    {t(stageKey)}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    {stageLeads.length}
                  </span>
                </div>
                {stageValue > 0 && (
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5 font-medium">
                    {formatCurrency(stageValue)}
                  </span>
                )}
              </div>
            </div>

            {/* LEADS LIST */}
            <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
              {stageLeads.length === 0 ? (
                <div className="h-24 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                  Drop lead here
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => onOpenLeadProfile(lead)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-falcon-500/60 text-xs cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="font-bold text-white group-hover:text-falcon-400 transition-colors line-clamp-1">
                        {lead.full_name}
                      </span>
                      <TemperatureBadge
                        temperature={lead.temperature}
                        score={lead.lead_score}
                      />
                    </div>

                    {lead.company_name && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 line-clamp-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{lead.company_name}</span>
                      </div>
                    )}

                    <div className="text-[11px] font-medium text-falcon-300 bg-falcon-950/60 px-2 py-0.5 rounded border border-falcon-800/40 inline-block line-clamp-1">
                      {lead.interested_machine_names?.[0] || "Custom CNC"}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                      <span className="font-mono text-emerald-400 font-semibold">
                        {lead.estimated_deal_value
                          ? formatCurrency(lead.estimated_deal_value)
                          : "TBD"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {lead.sales_owner_name || "Sales Rep"}
                      </span>
                    </div>

                    {/* Quick Move Dropdown for Mobile / Touch screens */}
                    <div className="pt-1 flex justify-end">
                      <select
                        value={lead.sales_stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const newStage = e.target.value as SalesStage;
                          if (newStage === "won") {
                            setWonModalLead(lead);
                            setWonDealValue(lead.estimated_deal_value || 25000);
                            setWonMachine(lead.interested_machine_names?.[0] || "Falcon CNC");
                          } else if (newStage === "lost") {
                            setLostModalLead(lead);
                          } else {
                            db.updateLeadStage(lead.id, newStage, undefined, currentUser.full_name).then((res) => {
                              if (res) onLeadUpdated(res);
                            });
                          }
                        }}
                        className="bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-300 py-0.5 px-1 focus:outline-none"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            Move to: {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* WON DEAL MODAL */}
      {wonModalLead && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-emerald-400">
                  {t("modal_won_title")}
                </h3>
              </div>
              <button
                onClick={() => setWonModalLead(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Congratulations! Record closing details for{" "}
              <strong className="text-white">{wonModalLead.full_name}</strong>.
            </p>

            <form onSubmit={handleConfirmWon} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {t("modal_won_deal_value")} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={wonDealValue}
                  onChange={(e) => setWonDealValue(Number(e.target.value))}
                  placeholder="e.g. 32000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {t("modal_won_machine_sold")} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={wonMachine}
                  onChange={(e) => setWonMachine(e.target.value)}
                  placeholder="e.g. Falcon ATC-Master 2030"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {t("modal_won_notes")}
                </label>
                <textarea
                  rows={2}
                  value={wonNotes}
                  onChange={(e) => setWonNotes(e.target.value)}
                  placeholder="Payment milestones, delivery timeframe..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWonModalLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Won Deal 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOST DEAL MODAL */}
      {lostModalLead && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base text-rose-400">
                  {t("modal_lost_title")}
                </h3>
              </div>
              <button
                onClick={() => setLostModalLead(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmLost} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {t("modal_lost_reason")} <span className="text-rose-400">*</span>
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="price">{t("reason_price")}</option>
                  <option value="competitor">{t("reason_competitor")}</option>
                  <option value="financing">{t("reason_financing")}</option>
                  <option value="delayed">{t("reason_delayed")}</option>
                  <option value="no_need">{t("reason_no_need")}</option>
                  <option value="technical">{t("reason_technical")}</option>
                  <option value="no_response">{t("reason_no_response")}</option>
                  <option value="other">{t("reason_other")}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {t("modal_lost_notes")}
                </label>
                <textarea
                  rows={3}
                  value={lostNotes}
                  onChange={(e) => setLostNotes(e.target.value)}
                  placeholder="Competitor name, price difference, or reason provided..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLostModalLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
