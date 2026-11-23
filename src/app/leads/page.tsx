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
  Sparkles,
  ChevronRight,
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
    <div className="space-y-4 sm:space-y-5">
      {/* 1. TOP HEADER & EXPORT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl glass-panel relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {t("nav_leads")}
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {filteredLeads.length}
            </span>
          </h1>
          <p className="text-xs text-slate-300/80 mt-0.5">
            Search, qualify, filter, and take instant action on exhibition prospects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can("view_all_leads") && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-pill text-slate-200 hover:text-white text-xs font-bold transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{t("export_csv")}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="p-3.5 sm:p-4 rounded-2xl glass-card space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, company, email, city..."
              className="w-full glass-input rounded-xl pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs text-white focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-input rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="newest" className="bg-slate-900">Sort: Newest First</option>
              <option value="score_high" className="bg-slate-900">Sort: Highest Score</option>
              <option value="hot_first" className="bg-slate-900">Sort: HOT Leads First</option>
              <option value="company" className="bg-slate-900">Sort: Company Name</option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-white/10">
          <span className="text-slate-400 flex items-center gap-1 text-[11px] font-semibold">
            <Filter className="w-3 h-3 text-cyan-400" /> Filters:
          </span>

          {/* Temperature */}
          <select
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
            className="glass-input rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all" className="bg-slate-900">All Temperatures</option>
            <option value="HOT" className="bg-slate-900">HOT (70-100)</option>
            <option value="WARM" className="bg-slate-900">WARM (40-69)</option>
            <option value="COLD" className="bg-slate-900">COLD (0-39)</option>
          </select>

          {/* Stage */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="glass-input rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all" className="bg-slate-900">All Pipeline Stages</option>
            <option value="new_lead" className="bg-slate-900">New Lead</option>
            <option value="contacted" className="bg-slate-900">Contacted</option>
            <option value="qualified" className="bg-slate-900">Qualified</option>
            <option value="consultation" className="bg-slate-900">Consultation</option>
            <option value="quotation_sent" className="bg-slate-900">Quotation Sent</option>
            <option value="negotiation" className="bg-slate-900">Negotiation</option>
            <option value="won" className="bg-slate-900">Won Deal</option>
            <option value="lost" className="bg-slate-900">Lost Deal</option>
          </select>

          {/* Exhibition */}
          <select
            value={exhibitionFilter}
            onChange={(e) => setExhibitionFilter(e.target.value)}
            className="glass-input rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all" className="bg-slate-900">All Exhibitions</option>
            {exhibitions.map((ex) => (
              <option key={ex.id} value={ex.id} className="bg-slate-900">
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
              className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline px-2 py-0.5 font-semibold"
            >
              {t("clear_filters")}
            </button>
          )}
        </div>
      </div>

      {/* 3. LEADS LIST */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-lg">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-bold text-slate-200">
              {t("no_records")}
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or capture a new lead.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-white/[0.03] border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Customer / Company</th>
                    <th className="py-3 px-3 font-semibold">Contact &amp; City</th>
                    <th className="py-3 px-3 font-semibold">Interested Machine</th>
                    <th className="py-3 px-3 font-semibold text-center">Score / Temp</th>
                    <th className="py-3 px-3 font-semibold">Stage</th>
                    <th className="py-3 px-3 font-semibold">Sales Owner</th>
                    <th className="py-3 px-4 font-semibold text-right rtl:text-left">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => {
                    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          setIsProfileOpen(true);
                        }}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                            {lead.full_name}
                          </div>
                          {lead.company_name && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>{lead.company_name}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-200">
                          <div>{lead.phone}</div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            {lead.city || "Cairo"}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-cyan-300">
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

                        <td className="py-3 px-3 text-slate-300">
                          {lead.sales_owner_name || "Sales Rep"}
                        </td>

                        <td
                          className="py-3 px-4 text-right rtl:text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end rtl:justify-start gap-1">
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 rounded-lg glass-pill text-blue-400 hover:text-white"
                              title={t("call")}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                              title={t("whatsapp")}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => {
                                setActionLead(lead);
                                setIsFollowUpOpen(true);
                              }}
                              className="p-1.5 rounded-lg glass-pill text-amber-400 hover:text-white"
                              title={t("schedule_followup")}
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setActionLead(lead);
                                setIsQROpen(true);
                              }}
                              className="p-1.5 rounded-lg glass-pill text-cyan-400 hover:text-white"
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

            {/* Mobile Luxury Glass Cards View */}
            <div className="md:hidden p-3 space-y-3">
              {filteredLeads.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                return (
                  <div
                    key={lead.id}
                    onClick={() => {
                      setSelectedLeadId(lead.id);
                      setIsProfileOpen(true);
                    }}
                    className="p-4 rounded-2xl glass-card glass-card-hover space-y-3 cursor-pointer relative overflow-hidden"
                  >
                    {/* Top Accent Highlight */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

                    {/* Card Header: Avatar Initial, Name, Temp Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-falcon-600 via-cyan-500 to-indigo-600 p-[1px] shadow-md shadow-falcon-600/20 shrink-0">
                          <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-white font-extrabold text-sm font-mono">
                            {lead.full_name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-white tracking-wide">
                            {lead.full_name}
                          </h3>
                          {lead.company_name && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[170px]">{lead.company_name}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <TemperatureBadge
                        temperature={lead.temperature}
                        score={lead.lead_score}
                      />
                    </div>

                    {/* Meta Row: Phone, City, Machine */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-mono text-cyan-300">{lead.phone}</span>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lead.city || "Cairo"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="font-semibold text-white truncate max-w-[180px]">
                          {lead.interested_machine_names?.[0] || "Custom CNC"}
                        </span>
                        <StageBadge stage={lead.sales_stage} />
                      </div>
                    </div>

                    {/* Mobile Quick Action Buttons Row */}
                    <div
                      className="grid grid-cols-4 gap-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </a>

                      <a
                        href={`tel:${lead.phone}`}
                        className="py-2 px-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال</span>
                      </a>

                      <button
                        onClick={() => {
                          setActionLead(lead);
                          setIsFollowUpOpen(true);
                        }}
                        className="py-2 px-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>متابعة</span>
                      </button>

                      <button
                        onClick={() => {
                          setActionLead(lead);
                          setIsQROpen(true);
                        }}
                        className="py-2 px-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR</span>
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
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Leads...</div>}>
      <LeadsContent />
    </Suspense>
  );
}
