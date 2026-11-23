"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { FollowUp, Lead } from "@/types/crm";
import { FollowUpModal } from "@/components/followups/FollowUpModal";
import { LeadProfileModal } from "@/components/leads/LeadProfileModal";
import { formatRelativeTime } from "@/lib/utils";
import {
  CalendarCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  Plus,
  Building,
  User,
  Filter,
  Sparkles,
} from "lucide-react";

function FollowUpsContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") || "today";

  const { t, language } = useLanguage();
  const { currentUser, currentRole } = useAuth();

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activeTab, setActiveTab] = useState<"today" | "overdue" | "upcoming" | "completed" | "all">(
    (initialView as any) || "today"
  );

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState<FollowUp | null>(null);
  const [profileLeadId, setProfileLeadId] = useState<string | null>(null);

  const reloadData = () => {
    db.getFollowUps().then(setFollowUps);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Filtering views
  const filteredList = useMemo(() => {
    return followUps.filter((item) => {
      // Rep access check
      if (currentRole === "sales_rep" && item.assigned_to && item.assigned_to !== currentUser.id) {
        return false;
      }

      const scheduledDate = new Date(item.scheduled_at);
      const isPast = scheduledDate < now;
      const isToday = item.scheduled_at.startsWith(todayStr);

      if (activeTab === "today") {
        return item.status === "pending" && isToday;
      }
      if (activeTab === "overdue") {
        return item.status === "pending" && isPast && !isToday;
      }
      if (activeTab === "upcoming") {
        return item.status === "pending" && !isPast && !isToday;
      }
      if (activeTab === "completed") {
        return item.status === "completed";
      }
      return true; // "all"
    });
  }, [followUps, activeTab, currentRole, currentUser.id, todayStr]);

  const countToday = followUps.filter(
    (f) =>
      f.status === "pending" &&
      f.scheduled_at.startsWith(todayStr) &&
      (currentRole !== "sales_rep" || f.assigned_to === currentUser.id)
  ).length;

  const countOverdue = followUps.filter(
    (f) =>
      f.status === "pending" &&
      new Date(f.scheduled_at) < now &&
      !f.scheduled_at.startsWith(todayStr) &&
      (currentRole !== "sales_rep" || f.assigned_to === currentUser.id)
  ).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl glass-panel relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {t("nav_followups")}
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
          </div>
          <p className="text-xs text-slate-300/80 mt-1">
            Manage phone calls, catalog deliveries, demos, and post-exhibition actions.
          </p>
        </div>

        <button
          onClick={() => {
            setCompletingTask(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-falcon-600 via-cyan-500 to-falcon-500 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-falcon-600/30 border border-white/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Task</span>
        </button>
      </div>

      {/* 2. TABS BAR (TODAY, OVERDUE, UPCOMING, COMPLETED, ALL) */}
      <div className="flex border border-white/10 glass-panel p-1.5 rounded-2xl gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "today"
              ? "bg-gradient-to-r from-falcon-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.35)] border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t("followup_today")}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 border border-white/10 font-mono">
            {countToday}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "overdue"
              ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)] border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{t("followup_overdue")}</span>
          {countOverdue > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-600 font-black font-mono shadow-[0_0_8px_#f43f5e]">
              {countOverdue}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "upcoming"
              ? "glass-pill text-white border-white/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>{t("followup_upcoming")}</span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "completed"
              ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t("followup_completed")}</span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "all"
              ? "glass-pill text-white border-white/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>{t("all")}</span>
        </button>
      </div>

      {/* 3. TASK LIST */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl border border-white/10 text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
            <p className="text-sm font-bold text-slate-200">
              No tasks found in this view
            </p>
            <p className="text-xs text-slate-400">All caught up! Great job on your sales pipeline.</p>
          </div>
        ) : (
          filteredList.map((task) => {
            const isCompleted = task.status === "completed";
            const isTaskOverdue =
              !isCompleted && new Date(task.scheduled_at) < now;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl glass-card glass-card-hover border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 relative overflow-hidden ${
                  isTaskOverdue
                    ? "border-rose-500/40 bg-gradient-to-r from-rose-950/20 to-slate-950/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                    : isCompleted
                    ? "border-white/5 opacity-75"
                    : "border-white/10"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-white">
                      {task.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 text-cyan-300 border border-white/10">
                      {task.type.replace("_", " ")}
                    </span>
                    {task.priority === "high" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)]">
                        HIGH
                      </span>
                    )}
                  </div>

                  {/* Customer Information */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <button
                      onClick={() => setProfileLeadId(task.lead_id)}
                      className="font-bold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{task.lead_name}</span>
                    </button>

                    {task.lead_company && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.lead_company}</span>
                      </span>
                    )}

                    <span>•</span>
                    <span className="font-mono text-slate-300">
                      {new Date(task.scheduled_at).toLocaleDateString()}{" "}
                      {new Date(task.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <span>•</span>
                    <span className="text-cyan-300/80 font-medium">
                      {formatRelativeTime(task.scheduled_at, language === "ar")}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {task.description}
                    </p>
                  )}

                  {/* Completed notes */}
                  {task.completion_notes && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/30 text-xs text-slate-200 mt-2">
                      <span className="text-emerald-400 font-bold block text-[11px] mb-0.5">
                        Completion Log:
                      </span>
                      {task.completion_notes}
                    </div>
                  )}
                </div>

                {/* Task Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {task.lead_phone && (
                    <>
                      <a
                        href={`tel:${task.lead_phone}`}
                        className="p-2.5 rounded-xl glass-pill text-blue-400 hover:text-white transition-all active:scale-95"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${task.lead_phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all active:scale-95"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => {
                        setCompletingTask(task);
                        setModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 border border-white/20 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("mark_completed")}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOLLOW-UP MODAL */}
      <FollowUpModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCompletingTask(null);
        }}
        targetFollowUp={completingTask}
        onSaved={reloadData}
      />

      {/* LEAD PROFILE MODAL */}
      <LeadProfileModal
        leadId={profileLeadId}
        isOpen={Boolean(profileLeadId)}
        onClose={() => setProfileLeadId(null)}
        onLeadUpdated={reloadData}
      />
    </div>
  );
}

export default function FollowUpsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Follow-ups...</div>}>
      <FollowUpsContent />
    </Suspense>
  );
}
