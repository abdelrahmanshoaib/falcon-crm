"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { UserProfile, Lead, FollowUp } from "@/types/crm";
import { ShieldCheck, UserPlus, Trophy, Users, Mail, Phone } from "lucide-react";

export default function TeamPage() {
  const { t } = useLanguage();
  const { currentUser, currentRole, can } = useAuth();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    Promise.all([db.getProfiles(), db.getLeads(), db.getFollowUps()]).then(
      ([profData, leadsData, fuData]) => {
        setProfiles(profData);
        setLeads(leadsData);
        setFollowUps(fuData);
      }
    );
  }, []);

  return (
    <div className="space-y-5">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-falcon-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("team_management")}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exhibition sales representatives, role permissions, and individual performance tracking.
          </p>
        </div>

        {can("manage_admins") && (
          <button
            onClick={() => alert("Invite user modal")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-falcon-600 hover:bg-falcon-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Sales Representative</span>
          </button>
        )}
      </div>

      {/* 2. TEAM ROSTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => {
          const repLeads = leads.filter((l) => l.sales_owner_id === profile.id);
          const repHot = repLeads.filter((l) => l.temperature === "HOT").length;
          const repQuotes = repLeads.filter((l) => l.sales_stage === "quotation_sent").length;
          const repWon = repLeads.filter((l) => l.sales_stage === "won").length;
          const repCompletedTasks = followUps.filter(
            (f) => f.assigned_to === profile.id && f.status === "completed"
          ).length;

          return (
            <div
              key={profile.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                    alt={profile.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {profile.full_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-falcon-300 border border-slate-700 inline-block mt-0.5">
                      {profile.role.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1 pt-3 border-t border-slate-800/80 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-4 gap-1.5 pt-3 text-center font-mono">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Leads
                    </span>
                    <span className="text-sm font-bold text-white">
                      {repLeads.length}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">
                      HOT
                    </span>
                    <span className="text-sm font-bold text-red-400">
                      {repHot}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Quotes
                    </span>
                    <span className="text-sm font-bold text-amber-400">
                      {repQuotes}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Won
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {repWon}
                    </span>
                  </div>
                </div>
              </div>

              {can("manage_admins") && (
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => alert(`Edit permissions for ${profile.full_name}`)}
                    className="text-xs text-falcon-400 hover:underline"
                  >
                    Configure Access
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
