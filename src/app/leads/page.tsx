"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { Lead, Exhibition, UserProfile, LeadTemperature, SalesStage } from "@/types/crm";
import { TemperatureBadge, StageBadge } from "@/components/common/Badges";
import { LeadProfileModal } from "@/components/leads/LeadProfileModal";
import { WhatsAppQRModal } from "@/components/whatsapp/WhatsAppQRModal";
import { FollowUpModal } from "@/components/followups/FollowUpModal";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  Search,
  Filter,
  Download,
  Phone,
  MessageCircle,
  CalendarPlus,
  QrCode,
  Building,
  User,
  MapPin,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";

function LeadsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialLeadId = searchParams.get("leadId") || "";
  const initialStage = searchParams.get("stage") || "all";
  const initialTemp = searchParams.get("temp") || "all";

  const { t, language } = useLanguage();
  const { currentUser, currentRole, can } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  // Search & Filter state
  const [search, setSearch] = useState(initialQuery);
  const [stageFilter, setStageFilter] = useState<string>(initialStage);
  const [tempFilter, setTempFilter] = useState<string>(initialTemp);
  const [exhibitionFilter, setExhibitionFilter] = useState<string>("all");
  const [repFilter, setRepFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "score_high" | "hot_first" | "company">("newest");

  // Selected Lead for Modals
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeadId || null);
  const [isProfileOpen, setIsProfileOpen] = useState(Boolean(initialLeadId));
  const [isQROpen, setIsQROpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [actionLead, setActionLead] = useState<Lead | null>(null);

  useEffect(() => {
    Promise.all([db.getLeads(), db.getExhibitions(), db.getProfiles()]).then(
      ([leadsData, exData, profData]) => {
        setLeads(leadsData);
        setExhibitions(exData);
        setProfiles(profData);
      }
    );
  }, []);

  // Filter & Search Logic
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Role permission check
        if (
          currentRole === "sales_rep" &&
          lead.sales_owner_id &&
          lead.sales_owner_id !== currentUser.id
        ) {
          return false;
        }

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase();
          const match =
            lead.full_name.toLowerCase().includes(q) ||
            lead.phone.includes(q) ||
            (lead.company_name && lead.company_name.toLowerCase().includes(q)) ||
            (lead.email && lead.email.toLowerCase().includes(q)) ||
            (lead.city && lead.city.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Filters
        if (stageFilter !== "all" && lead.sales_stage !== stageFilter) return false;
        if (tempFilter !== "all" && lead.temperature !== tempFilter) return false;
        if (exhibitionFilter !== "all" && lead.exhibition_id !== exhibitionFilter) return false;
        if (repFilter !== "all" && lead.sales_owner_id !== repFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "score_high") {
          return b.lead_score - a.lead_score;
        }
        if (sortBy === "hot_first") {
          const order = { HOT: 3, WARM: 2, COLD: 1 };
          return (order[b.temperature] || 0) - (order[a.temperature] || 0);
        }
        if (sortBy === "company") {
          return (a.company_name || "").localeCompare(b.company_name || "");
        }
        return 0;
      });
  }, [
    leads,
    search,
    stageFilter,
    tempFilter,
    exhibitionFilter,
    repFilter,
    sortBy,
    currentRole,
    currentUser.id,
  ]);

  const handleExportCSV = () => {
    if (!can("view_all_leads") && currentRole === "sales_rep") {
      alert("Exporting company leads is restricted to Managers and Admins.");
      return;
    }

    const headers = [
      "Name",
      "Company",
      "Phone",
      "City",
      "Machine Interest",
      "Score",
      "Temperature",
      "Stage",
      "Deal Value",
      "Sales Rep",
      "Exhibition",
      "Created At",
    ];

    const rows = filteredLeads.map((l) => [
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
      `"${l.created_at}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `falcon_leads_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & EXPORT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t("nav_leads")} ({filteredLeads.length})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, qualify, filter, and take instant action on exhibition prospects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can("view_all_leads") && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{t("export_csv")}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, company, email, city..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs text-white focus:outline-none focus:border-falcon-500 placeholder-slate-500"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-falcon-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="score_high">Sort: Highest Score</option>
              <option value="hot_first">Sort: HOT Leads First</option>
              <option value="company">Sort: Company Name</option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Temperature */}
          <select
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-300 text-xs"
          >
            <option value="all">All Temperatures</option>
            <option value="HOT">HOT (70-100)</option>
            <option value="WARM">WARM (40-69)</option>
            <option value="COLD">COLD (0-39)</option>
          </select>

          {/* Stage */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-300 text-xs"
          >
            <option value="all">All Pipeline Stages</option>
            <option value="new_lead">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="consultation">Consultation</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won Deal</option>
            <option value="lost">Lost Deal</option>
          </select>

          {/* Exhibition */}
          <select
            value={exhibitionFilter}
            onChange={(e) => setExhibitionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-300 text-xs"
          >
            <option value="all">All Exhibitions</option>
            {exhibitions.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(stageFilter !== "all" || tempFilter !== "all" || exhibitionFilter !== "all" || search) && (
            <button
              onClick={() => {
                setStageFilter("all");
                setTempFilter("all");
                setExhibitionFilter("all");
                setSearch("");
              }}
              className="text-[11px] text-rose-400 hover:underline px-2 py-0.5"
            >
              {t("clear_filters")}
            </button>
          )}
        </div>
      </div>

      {/* 3. LEADS LIST (RESPONSIVE TABLE DESKTOP / CARD LIST MOBILE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <p className="text-sm font-semibold text-slate-300">
              {t("no_records")}
            </p>
            <p className="text-xs">
              Try adjusting your search criteria or capture a new lead.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Customer / Company</th>
                    <th className="py-3 px-3 font-semibold">Phone / City</th>
                    <th className="py-3 px-3 font-semibold">Machine Interest</th>
                    <th className="py-3 px-3 font-semibold text-center">Score / Temp</th>
                    <th className="py-3 px-3 font-semibold">Stage</th>
                    <th className="py-3 px-3 font-semibold">Owner</th>
                    <th className="py-3 px-4 font-semibold text-right rtl:text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeads.map((lead) => {
                    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          setIsProfileOpen(true);
                        }}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-white group-hover:text-falcon-400 transition-colors">
                            {lead.full_name}
                          </div>
                          {lead.company_name && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>{lead.company_name}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-300">
                          <div>{lead.phone}</div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            {lead.city || "Cairo"}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-falcon-300">
                            {lead.interested_machine_names?.[0] || "Custom Inquiry"}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <TemperatureBadge
                            temperature={lead.temperature}
                            score={lead.lead_score}
                          />
                        </td>

                        <td className="py-3 px-3">
                          <StageBadge stage={lead.sales_stage} />
                        </td>

                        <td className="py-3 px-3 text-slate-400">
                          {lead.sales_owner_name || "Sales Rep"}
                        </td>

                        <td
                          className="py-3 px-4 text-right rtl:text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end rtl:justify-start gap-1">
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400"
                              title={t("call")}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/50"
                              title={t("whatsapp")}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => {
                                setActionLead(lead);
                                setIsFollowUpOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                              title={t("schedule_followup")}
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setActionLead(lead);
                                setIsQROpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-falcon-400"
                              title={t("generate_qr")}
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-800">
              {filteredLeads.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                return (
                  <div
                    key={lead.id}
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setIsProfileOpen(true);
                    }}
                    className="p-3.5 space-y-2.5 active:bg-slate-800/50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-white">
                          {lead.full_name}
                        </h3>
                        {lead.company_name && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            {lead.company_name}
                          </p>
                        )}
                      </div>
                      <TemperatureBadge
                        temperature={lead.temperature}
                        score={lead.lead_score}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-mono">{lead.phone}</span>
                      <span className="text-slate-400">{lead.city}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                      <span className="text-falcon-400 font-medium">
                        {lead.interested_machine_names?.[0] || "Custom CNC"}
                      </span>
                      <StageBadge stage={lead.sales_stage} />
                    </div>

                    {/* Mobile Quick Action Buttons */}
                    <div
                      className="flex items-center gap-1.5 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                      <button
                        onClick={() => {
                          setActionLead(lead);
                          setIsQROpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-falcon-400"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* LEAD PROFILE MODAL */}
      <LeadProfileModal
        leadId={selectedLeadId}
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        }}
        onOpenFollowUp={(l) => {
          setActionLead(l);
          setIsFollowUpOpen(true);
        }}
        onOpenQR={(l) => {
          setActionLead(l);
          setIsQROpen(true);
        }}
      />

      {/* QR MODAL */}
      <WhatsAppQRModal
        isOpen={isQROpen}
        onClose={() => {
          setIsQROpen(false);
          setActionLead(null);
        }}
        preselectedLead={actionLead}
      />

      {/* FOLLOW-UP MODAL */}
      <FollowUpModal
        isOpen={isFollowUpOpen}
        onClose={() => {
          setIsFollowUpOpen(false);
          setActionLead(null);
        }}
        targetLead={actionLead}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Leads...</div>}>
      <LeadsContent />
    </Suspense>
  );
}
