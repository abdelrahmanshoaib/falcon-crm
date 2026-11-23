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
    <div className="space-y-4">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("nav_followups")}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage phone calls, catalog deliveries, demos, and post-exhibition actions.
          </p>
        </div>

        <button
          onClick={() => {
            setCompletingTask(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-falcon-600 hover:bg-falcon-500 text-white font-semibold text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Task</span>
        </button>
      </div>

      {/* 2. TABS BAR (TODAY, OVERDUE, UPCOMING, COMPLETED, ALL) */}
      <div className="flex border-b border-slate-800 bg-slate-900 p-1.5 rounded-2xl gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "today"
              ? "bg-falcon-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{t("followup_today")}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
            {countToday}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "overdue"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{t("followup_overdue")}</span>
          {countOverdue > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-600 font-bold font-mono">
              {countOverdue}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "upcoming"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>{t("followup_upcoming")}</span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "completed"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t("followup_completed")}</span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === "all"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>{t("all")}</span>
        </button>
      </div>

      {/* 3. TASK LIST */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-60" />
            <p className="text-sm font-semibold text-slate-300">
              No tasks found in this view
            </p>
            <p className="text-xs">All caught up! Great job.</p>
          </div>
        ) : (
          filteredList.map((task) => {
            const isCompleted = task.status === "completed";
            const isTaskOverdue =
              !isCompleted && new Date(task.scheduled_at) < now;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-slate-900 border transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isTaskOverdue
                    ? "border-rose-500/40 bg-rose-950/10"
                    : isCompleted
                    ? "border-slate-800/60 opacity-80"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {task.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {task.type.replace("_", " ")}
                    </span>
                    {task.priority === "high" && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                        HIGH
                      </span>
                    )}
                  </div>

                  {/* Customer Information */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <button
                      onClick={() => setProfileLeadId(task.lead_id)}
                      className="font-semibold text-falcon-400 hover:underline flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{task.lead_name}</span>
                    </button>

                    {task.lead_company && (
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{task.lead_company}</span>
                      </span>
                    )}

                    <span>•</span>
                    <span>
                      Scheduled:{" "}
                      <strong className="text-slate-300 font-mono">
                        {new Date(task.scheduled_at).toLocaleDateString()}{" "}
                        {new Date(task.scheduled_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </span>

                    <span>•</span>
                    <span>
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
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 italic mt-2">
                      <span className="text-emerald-400 not-italic font-semibold block text-[11px] mb-0.5">
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
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${task.lead_phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 transition-colors"
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
                      className="px-3.5 py-2 rounded-xl bg-falcon-600 hover:bg-falcon-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
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
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Follow-ups...</div>}>
      <FollowUpsContent />
    </Suspense>
  );
}
