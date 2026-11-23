"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import {
  Lead,
  LeadTemperature,
  Machine,
  Exhibition,
  PurchaseTimeline,
  PurchaseIntent,
  BudgetStatus,
  FactoryStatus,
  DecisionRole,
} from "@/types/crm";
import {
  X,
  Zap,
  Phone,
  Building,
  User,
  Cpu,
  Flame,
  ThermometerSun,
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  CalendarPlus,
  QrCode,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { normalizePhoneNumber } from "@/lib/utils";
import { TemperatureBadge } from "../common/Badges";

interface QuickLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadSaved?: (lead: Lead) => void;
  onActionSelect?: (action: "profile" | "followup" | "qr", lead: Lead) => void;
}

export function QuickLeadModal({
  isOpen,
  onClose,
  onLeadSaved,
  onActionSelect,
}: QuickLeadModalProps) {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Damietta");
  const [jobTitle, setJobTitle] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [temperature, setTemperature] = useState<LeadTemperature>("HOT");
  const [notes, setNotes] = useState("");
  const [exhibitionId, setExhibitionId] = useState("");

  // Progressive Disclosure (Full Details)
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [factoryStatus, setFactoryStatus] = useState<FactoryStatus>("yes");
  const [businessSector, setBusinessSector] = useState("Furniture Manufacturing");
  const [purchaseIntent, setPurchaseIntent] = useState<PurchaseIntent>("ready_to_buy");
  const [purchaseTimeline, setPurchaseTimeline] = useState<PurchaseTimeline>("within_30_days");
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus>("budget_available");
  const [decisionRole, setDecisionRole] = useState<DecisionRole>("owner");

  // Duplicate state
  const [duplicateLead, setDuplicateLead] = useState<Lead | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);

  // Success state
  const [savedLead, setSavedLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      db.getMachines().then((list) => {
        setMachines(list);
        if (list.length > 0 && !selectedMachine) setSelectedMachine(list[0].name);
      });
      db.getExhibitions().then((list) => {
        setExhibitions(list);
        if (list.length > 0) setExhibitionId(list[0].id);
      });
    }
  }, [isOpen]);

  // Real-time duplicate phone checking on blur or phone length >= 9
  const handlePhoneChange = async (val: string) => {
    setPhone(val);
    setBypassDuplicate(false);
    const cleaned = normalizePhoneNumber(val);
    if (cleaned.length >= 10) {
      setIsCheckingDuplicate(true);
      const match = await db.checkDuplicate(val);
      setDuplicateLead(match);
      setIsCheckingDuplicate(false);
    } else {
      setDuplicateLead(null);
    }
  };

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setCompanyName("");
    setEmail("");
    setJobTitle("");
    setNotes("");
    setDuplicateLead(null);
    setBypassDuplicate(false);
    setSavedLead(null);
    setShowFullDetails(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    if (duplicateLead && !bypassDuplicate) {
      return;
    }

    setIsSaving(true);
    try {
      const activeExhibition = exhibitions.find((e) => e.id === exhibitionId);

      const leadData: Partial<Lead> = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        company_name: companyName.trim(),
        email: email.trim() || undefined,
        job_title: jobTitle.trim() || undefined,
        city: city || "Cairo",
        business_sector: businessSector,
        interested_machine_names: selectedMachine ? [selectedMachine] : [],
        temperature: temperature,
        notes: notes.trim(),
        exhibition_id: exhibitionId || undefined,
        exhibition_name: activeExhibition?.name || "Cairo WoodShow 2026",
        sales_owner_id: currentUser.id,
        sales_owner_name: currentUser.full_name,
        source: "exhibition_booth",

        // Qualification
        factory_status: factoryStatus,
        purchase_intent: purchaseIntent,
        purchase_timeline: purchaseTimeline,
        budget_status: budgetStatus,
        decision_role: decisionRole,
      };

      const result = await db.createLead(leadData, currentUser.full_name);
      setSavedLead(result);
      if (onLeadSaved) onLeadSaved(result);
    } catch (err) {
      console.error("Failed to save lead:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="glass-modal rounded-[28px] w-full max-w-xl text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-auto border border-white/20 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Specular Edge Highlight */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* POST-SAVE ACTION SCREEN */}
        {savedLead ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-950/60 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                {t("post_save_title")}
                <Sparkles className="w-5 h-5 text-amber-400" />
              </h3>
              <p className="text-sm sm:text-base text-slate-200 mt-1 font-bold">
                {savedLead.full_name}{" "}
                {savedLead.company_name && (
                  <span className="text-cyan-300 font-normal">({savedLead.company_name})</span>
                )}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <TemperatureBadge
                  temperature={savedLead.temperature}
                  score={savedLead.lead_score}
                />
                <span className="text-xs text-slate-400 font-mono">
                  {savedLead.interested_machine_names?.[0]}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onActionSelect) onActionSelect("followup", savedLead);
                  onClose();
                  resetForm();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl glass-card glass-card-hover transition-all text-xs font-bold text-white gap-2"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <span>{t("action_create_followup")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onActionSelect) onActionSelect("qr", savedLead);
                  onClose();
                  resetForm();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl glass-card glass-card-hover transition-all text-xs font-bold text-white gap-2"
              >
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <span>{t("action_make_qr")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onActionSelect) onActionSelect("profile", savedLead);
                  onClose();
                  resetForm();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl glass-card glass-card-hover transition-all text-xs font-bold text-white gap-2"
              >
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <span>{t("action_open_profile")}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-falcon-600 to-cyan-500 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-falcon-600/30 border border-white/20"
              >
                <Plus className="w-4 h-4" />
                <span>{t("action_capture_another")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="px-4 py-2.5 rounded-xl glass-pill text-slate-300 hover:text-white text-xs font-semibold"
              >
                {t("close")}
              </button>
            </div>
          </div>
        ) : (
          /* QUICK LEAD CAPTURE FORM (<60s) */
          <form onSubmit={handleSave} className="flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-falcon-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-falcon-500/30 border border-white/20">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-white leading-tight flex items-center gap-1.5">
                    {t("quick_lead_title")}
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                      &lt;60s
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {t("quick_lead_subtitle")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white glass-pill transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DUPLICATE WARNING BANNER */}
            {duplicateLead && !bypassDuplicate && (
              <div className="m-4 mb-0 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-300">
                      {t("duplicate_warning_title")}
                    </h4>
                    <p className="text-[11px] text-amber-200/90 mt-0.5">
                      {t("duplicate_warning_desc")}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Existing Customer:</span>
                    <span className="font-semibold text-white">
                      {duplicateLead.full_name} ({duplicateLead.company_name || "N/A"})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Owner:</span>
                    <span>{duplicateLead.sales_owner_name || "Sales Rep"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Stage:</span>
                    <span className="capitalize text-amber-300 font-semibold">{duplicateLead.sales_stage.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onActionSelect) onActionSelect("profile", duplicateLead);
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs text-center transition-colors shadow-md"
                  >
                    {t("duplicate_view_existing")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setBypassDuplicate(true)}
                    className="py-2 px-3 rounded-xl glass-pill text-slate-300 text-xs font-semibold"
                  >
                    {t("duplicate_continue_save")}
                  </button>
                </div>
              </div>
            )}

            {/* FORM BODY */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              {/* 1. Full Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t("field_customer_name")} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("field_customer_name_placeholder")}
                    className="w-full glass-input rounded-xl pl-10 pr-3.5 rtl:pl-3.5 rtl:pr-10 py-3 text-sm text-white focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              {/* 2. Mobile Phone (Required, Large Touch, Tel Mode) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t("field_phone")} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={t("field_phone_placeholder")}
                    className="w-full glass-input rounded-xl pl-10 pr-3.5 rtl:pl-3.5 rtl:pr-10 py-3 text-base sm:text-sm font-mono text-cyan-300 focus:outline-none placeholder-slate-500 tracking-wider font-bold"
                  />
                  {isCheckingDuplicate && (
                    <span className="absolute right-3 rtl:right-auto rtl:left-3 top-3.5 text-[11px] text-cyan-400 font-mono animate-pulse">
                      Checking...
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Company Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t("field_company")}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={t("field_company_placeholder")}
                      className="w-full glass-input rounded-xl pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-xs text-white focus:outline-none placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t("field_city")}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Damietta" className="bg-slate-900">Damietta (دمياط)</option>
                    <option value="10th of Ramadan" className="bg-slate-900">10th of Ramadan (العاشر من رمضان)</option>
                    <option value="6th of October" className="bg-slate-900">6th of October (السادس من أكتوبر)</option>
                    <option value="Cairo" className="bg-slate-900">Cairo (القاهرة)</option>
                    <option value="Alexandria" className="bg-slate-900">Alexandria (الإسكندرية)</option>
                    <option value="Sadat City" className="bg-slate-900">Sadat City (مدينة السادات)</option>
                    <option value="Obour" className="bg-slate-900">Obour City (العبور)</option>
                    <option value="Giza" className="bg-slate-900">Giza (الجيزة)</option>
                    <option value="Other" className="bg-slate-900">Other Region</option>
                  </select>
                </div>
              </div>

              {/* 4. Interested Machine & Temperature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t("field_machine_interest")}
                  </label>
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    {machines.map((m) => (
                      <option key={m.id} value={m.name} className="bg-slate-900">
                        {m.name} ({m.category})
                      </option>
                    ))}
                    <option value="Other Machine" className="bg-slate-900">Other Custom Machine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t("field_temperature")}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setTemperature("HOT")}
                      className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        temperature === "HOT"
                          ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] border border-red-400"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-white" />
                      <span>HOT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemperature("WARM")}
                      className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        temperature === "WARM"
                          ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-300"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <ThermometerSun className="w-3.5 h-3.5" />
                      <span>WARM</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemperature("COLD")}
                      className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        temperature === "COLD"
                          ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-300"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Snowflake className="w-3.5 h-3.5" />
                      <span>COLD</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t("field_quick_notes")}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("field_quick_notes_placeholder")}
                  className="w-full glass-input rounded-xl p-3 text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* PROGRESSIVE DISCLOSURE - FULL QUALIFICATION DETAILS */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="flex items-center justify-between w-full py-2 px-3 rounded-xl glass-pill text-xs font-semibold text-cyan-300 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {showFullDetails ? "Hide In-Depth Qualification" : "Add In-Depth B2B Qualification (Optional)"}
                  </span>
                  {showFullDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showFullDetails && (
                  <div className="mt-3 p-3.5 rounded-2xl glass-card space-y-3 animate-in fade-in duration-200 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">
                          {t("q_factory_status")}
                        </label>
                        <select
                          value={factoryStatus}
                          onChange={(e) => setFactoryStatus(e.target.value as FactoryStatus)}
                          className="w-full glass-input rounded-lg p-2 text-white"
                        >
                          <option value="yes" className="bg-slate-900">{t("q_factory_yes")}</option>
                          <option value="under_construction" className="bg-slate-900">{t("q_factory_construction")}</option>
                          <option value="planning" className="bg-slate-900">{t("q_factory_planning")}</option>
                          <option value="no" className="bg-slate-900">{t("q_factory_no")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">
                          {t("q_purchase_intent")}
                        </label>
                        <select
                          value={purchaseIntent}
                          onChange={(e) => setPurchaseIntent(e.target.value as PurchaseIntent)}
                          className="w-full glass-input rounded-lg p-2 text-white"
                        >
                          <option value="ready_to_buy" className="bg-slate-900">{t("q_intent_ready")}</option>
                          <option value="comparing" className="bg-slate-900">{t("q_intent_comparing")}</option>
                          <option value="future_planning" className="bg-slate-900">{t("q_intent_future")}</option>
                          <option value="browsing" className="bg-slate-900">{t("q_intent_general")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">
                          {t("q_purchase_timeline")}
                        </label>
                        <select
                          value={purchaseTimeline}
                          onChange={(e) => setPurchaseTimeline(e.target.value as PurchaseTimeline)}
                          className="w-full glass-input rounded-lg p-2 text-white"
                        >
                          <option value="within_30_days" className="bg-slate-900">{t("q_timeline_30d")}</option>
                          <option value="1_to_3_months" className="bg-slate-900">{t("q_timeline_1_3m")}</option>
                          <option value="3_to_6_months" className="bg-slate-900">{t("q_timeline_3_6m")}</option>
                          <option value="more_than_6_months" className="bg-slate-900">{t("q_timeline_6_12m")}</option>
                          <option value="unknown" className="bg-slate-900">{t("q_timeline_unknown")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">
                          {t("q_budget_status")}
                        </label>
                        <select
                          value={budgetStatus}
                          onChange={(e) => setBudgetStatus(e.target.value as BudgetStatus)}
                          className="w-full glass-input rounded-lg p-2 text-white"
                        >
                          <option value="budget_available" className="bg-slate-900">{t("q_budget_available")}</option>
                          <option value="financing_needed" className="bg-slate-900">{t("q_budget_financing")}</option>
                          <option value="budget_not_defined" className="bg-slate-900">{t("q_budget_undefined")}</option>
                          <option value="not_discussed" className="bg-slate-900">{t("q_budget_not_discussed")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer with Save Lead Action */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl glass-pill text-slate-300 hover:text-white text-xs font-semibold"
              >
                {t("cancel")}
              </button>

              <button
                type="submit"
                disabled={isSaving || !fullName.trim() || !phone.trim() || (!!duplicateLead && !bypassDuplicate)}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-falcon-600 via-cyan-500 to-falcon-500 hover:brightness-110 text-white font-extrabold text-sm shadow-[0_8px_25px_rgba(14,165,233,0.4)] border border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{isSaving ? t("loading") : t("save_lead_btn")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
