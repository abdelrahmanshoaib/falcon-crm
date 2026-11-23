"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import {
  FollowUp,
  FollowUpType,
  FollowUpPriority,
  Lead,
  LeadTemperature,
} from "@/types/crm";
import {
  X,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Users,
  FileText,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLead?: Lead | null;
  targetFollowUp?: FollowUp | null; // If completing an existing task
  onSaved?: (item: FollowUp) => void;
}

export function FollowUpModal({
  isOpen,
  onClose,
  targetLead,
  targetFollowUp,
  onSaved,
}: FollowUpModalProps) {
  const { t } = useLanguage();
  const { currentUser, allProfiles } = useAuth();

  // Mode: "create" or "complete"
  const isCompleting = Boolean(targetFollowUp);

  // Form states for creation
  const [leadId, setLeadId] = useState(targetLead?.id || "");
  const [type, setType] = useState<FollowUpType>("phone_call");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0]
  );
  const [scheduledTime, setScheduledTime] = useState("11:00");
  const [priority, setPriority] = useState<FollowUpPriority>("medium");
  const [assignedTo, setAssignedTo] = useState(currentUser.id);

  // Form states for completion
  const [completionNotes, setCompletionNotes] = useState("");
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState(
    new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split("T")[0]
  );
  const [updatedTemp, setUpdatedTemp] = useState<LeadTemperature>("HOT");

  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (!targetLead) {
        db.getLeads().then(setAllLeads);
      } else {
        setLeadId(targetLead.id);
        setTitle(`Follow-up with ${targetLead.full_name}`);
        setUpdatedTemp(targetLead.temperature);
      }
    }
  }, [isOpen, targetLead]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCompleting && targetFollowUp) {
      if (!completionNotes.trim()) return;
      const completed = await db.completeFollowUp(
        targetFollowUp.id,
        completionNotes.trim(),
        scheduleNext ? `${nextDate}T10:00:00Z` : undefined,
        currentUser.full_name
      );

      // If scheduled next, create the next follow up
      if (scheduleNext && targetFollowUp.lead_id) {
        await db.createFollowUp(
          {
            lead_id: targetFollowUp.lead_id,
            lead_name: targetFollowUp.lead_name,
            title: `Next Touch: ${targetFollowUp.lead_name}`,
            scheduled_at: `${nextDate}T10:00:00Z`,
            type: "phone_call",
            priority: "medium",
          },
          currentUser.full_name
        );
      }

      if (completed && onSaved) onSaved(completed);
      onClose();
      return;
    }

    // Creating new Follow-up
    const activeLead = targetLead || allLeads.find((l) => l.id === leadId);
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    const created = await db.createFollowUp(
      {
        lead_id: leadId,
        lead_name: activeLead?.full_name || "Lead",
        lead_company: activeLead?.company_name,
        lead_phone: activeLead?.phone,
        type,
        title: title.trim() || `Follow-up with ${activeLead?.full_name}`,
        description: description.trim(),
        scheduled_at: scheduledDateTime,
        priority,
        assigned_to: assignedTo,
        assigned_to_name:
          allProfiles.find((p) => p.id === assignedTo)?.full_name || currentUser.full_name,
      },
      currentUser.full_name
    );

    if (onSaved) onSaved(created);
    onClose();
  };

  const followUpTypes: { type: FollowUpType; label: string }[] = [
    { type: "phone_call", label: "Phone Call" },
    { type: "whatsapp", label: "WhatsApp Message" },
    { type: "meeting", label: "Meeting / Booth Visit" },
    { type: "send_quotation", label: "Send Official Quotation" },
    { type: "send_catalog", label: "Send Machinery Catalog" },
    { type: "demo", label: "Showroom CNC Live Demo" },
    { type: "factory_visit", label: "Factory Site Survey" },
    { type: "financing", label: "Financing / Installment Review" },
    { type: "email", label: "Email Proposal" },
    { type: "other", label: "Other Action" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="glass-modal border border-white/20 rounded-[28px] w-full max-w-lg text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-200">
        {/* Specular Edge Highlight */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                {isCompleting ? "Complete Follow-up Task" : "Schedule New Follow-up"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isCompleting
                  ? targetFollowUp?.title
                  : targetLead
                  ? `For ${targetLead.full_name}`
                  : "Assign next sales task"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-pill text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {isCompleting ? (
            /* COMPLETION WORKFLOW */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Task:</span>
                <span className="font-bold text-white text-sm">
                  {targetFollowUp?.title}
                </span>
                <span className="text-slate-400 text-[11px] block">
                  Lead: {targetFollowUp?.lead_name} (
                  {targetFollowUp?.lead_company || "N/A"})
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Interaction Summary Notes <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Record what was agreed during call, price reaction, machine questions..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-falcon-500 placeholder-slate-500"
                />
              </div>

              {/* Schedule Next Follow-up Option */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                    className="w-4 h-4 rounded text-falcon-600 focus:ring-0"
                  />
                  <span>Schedule next follow-up touch?</span>
                </label>

                {scheduleNext && (
                  <div className="pt-2">
                    <label className="block text-slate-400 mb-1">Next Date</label>
                    <input
                      type="date"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* CREATION WORKFLOW */
            <div className="space-y-3.5">
              {!targetLead && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Select Lead
                  </label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="">Select customer...</option>
                    {allLeads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.full_name} ({l.company_name || l.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Follow-up Type */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Follow-up Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FollowUpType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  {followUpTypes.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Call regarding Spindle Specs & Quotation"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              {/* Priority & Assignee */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as FollowUpPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Assigned Rep
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  >
                    {allProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.role.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description / Objective
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Points to discuss, files to prepare..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-falcon-600 hover:bg-falcon-500 text-white font-bold transition-all shadow-md"
            >
              {isCompleting ? t("mark_completed") : t("schedule_followup")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
