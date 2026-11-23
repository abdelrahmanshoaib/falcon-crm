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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* POST-SAVE ACTION SCREEN */}
        {savedLead ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                {t("post_save_title")}
              </h3>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                {savedLead.full_name}{" "}
                {savedLead.company_name && `(${savedLead.company_name})`}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <TemperatureBadge
                  temperature={savedLead.temperature}
                  score={savedLead.lead_score}
                />
                <span className="text-xs text-slate-400">
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
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-xs font-semibold text-white gap-1.5"
              >
                <CalendarPlus className="w-5 h-5 text-amber-400" />
                <span>{t("action_create_followup")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onActionSelect) onActionSelect("qr", savedLead);
                  onClose();
                  resetForm();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-xs font-semibold text-white gap-1.5"
              >
                <QrCode className="w-5 h-5 text-falcon-400" />
                <span>{t("action_make_qr")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onActionSelect) onActionSelect("profile", savedLead);
                  onClose();
                  resetForm();
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-xs font-semibold text-white gap-1.5"
              >
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>{t("action_open_profile")}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-falcon-600 hover:bg-falcon-500 text-white text-xs font-semibold"
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
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t("close")}
              </button>
            </div>
          </div>
        ) : (
          /* QUICK LEAD CAPTURE FORM (<60s) */
          <form onSubmit={handleSave} className="flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-falcon-600/20 border border-falcon-500/40 flex items-center justify-center text-falcon-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-white leading-tight">
                    {t("quick_lead_title")}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {t("quick_lead_subtitle")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DUPLICATE WARNING BANNER */}
            {duplicateLead && !bypassDuplicate && (
              <div className="m-4 mb-0 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2">
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

                <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20 text-[11px] space-y-1">
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
                    <span className="capitalize">{duplicateLead.sales_stage.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onActionSelect) onActionSelect("profile", duplicateLead);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] text-center"
                  >
                    {t("duplicate_view_existing")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setBypassDuplicate(true)}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                  >
                    {t("duplicate_continue_save")}
                  </button>
                </div>
              </div>
            )}

            {/* FORM BODY */}
            <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
              {/* 1. Full Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t("field_customer_name")} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("field_customer_name_placeholder")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-sm text-white focus:outline-none focus:border-falcon-500 focus:ring-1 focus:ring-falcon-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* 2. Mobile Phone (Required, Large Touch, Tel Mode) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t("field_phone")} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={t("field_phone_placeholder")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-falcon-500 focus:ring-1 focus:ring-falcon-500 placeholder-slate-500 tracking-wide"
                  />
                  {isCheckingDuplicate && (
                    <span className="absolute right-3 rtl:right-auto rtl:left-3 top-3 text-[11px] text-slate-400">
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
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-sm text-white focus:outline-none focus:border-falcon-500 placeholder-slate-500"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-falcon-500"
                  >
                    <option value="Damietta">Damietta (دمياط)</option>
                    <option value="10th of Ramadan">10th of Ramadan (العاشر من رمضان)</option>
                    <option value="6th of October">6th of October (السادس من أكتوبر)</option>
                    <option value="Cairo">Cairo (القاهرة)</option>
                    <option value="Alexandria">Alexandria (الإسكندرية)</option>
                    <option value="Sadat City">Sadat City (مدينة السادات)</option>
                    <option value="Obour">Obour City (العبور)</option>
                    <option value="Giza">Giza (الجيزة)</option>
                    <option value="Other">Other Region</option>
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-falcon-500"
                  >
                    {machines.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.category})
                      </option>
                    ))}
                    <option value="Other Machine">Other Custom Machine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t("field_temperature")}
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setTemperature("HOT")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        temperature === "HOT"
                          ? "bg-red-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      HOT
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemperature("WARM")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        temperature === "WARM"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <ThermometerSun className="w-3.5 h-3.5" />
                      WARM
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemperature("COLD")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        temperature === "COLD"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Snowflake className="w-3.5 h-3.5" />
                      COLD
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. Quick Booth Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t("field_quick_notes")}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("field_quick_notes_placeholder")}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-falcon-500 placeholder-slate-500"
                />
              </div>

              {/* 6. PROGRESSIVE DISCLOSURE TOGGLE (Deep Qualification) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-semibold">
                    {showFullDetails
                      ? "Hide Advanced Qualification Options"
                      : "Add Deep Qualification & B2B Details (+Scoring)"}
                  </span>
                  {showFullDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showFullDetails && (
                  <div className="p-3 mt-2 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    {/* Factory Status */}
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">
                        {t("q_factory_status")}
                      </label>
                      <select
                        value={factoryStatus}
                        onChange={(e) => setFactoryStatus(e.target.value as FactoryStatus)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      >
                        <option value="yes">{t("q_factory_yes")}</option>
                        <option value="under_construction">{t("q_factory_construction")}</option>
                        <option value="planning">{t("q_factory_planning")}</option>
                        <option value="no">{t("q_factory_no")}</option>
                      </select>
                    </div>

                    {/* Purchase Intent & Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">
                          {t("q_purchase_intent")}
                        </label>
                        <select
                          value={purchaseIntent}
                          onChange={(e) => setPurchaseIntent(e.target.value as PurchaseIntent)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        >
                          <option value="ready_to_buy">{t("q_intent_ready")}</option>
                          <option value="comparing_options">{t("q_intent_comparing")}</option>
                          <option value="planning_future">{t("q_intent_future")}</option>
                          <option value="general_interest">{t("q_intent_general")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">
                          {t("q_purchase_timeline")}
                        </label>
                        <select
                          value={purchaseTimeline}
                          onChange={(e) => setPurchaseTimeline(e.target.value as PurchaseTimeline)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        >
                          <option value="within_30_days">{t("q_timeline_30d")}</option>
                          <option value="1_3_months">{t("q_timeline_1_3m")}</option>
                          <option value="3_6_months">{t("q_timeline_3_6m")}</option>
                          <option value="6_12_months">{t("q_timeline_6_12m")}</option>
                          <option value="unknown">{t("q_timeline_unknown")}</option>
                        </select>
                      </div>
                    </div>

                    {/* Budget & Decision Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">
                          {t("q_budget_status")}
                        </label>
                        <select
                          value={budgetStatus}
                          onChange={(e) => setBudgetStatus(e.target.value as BudgetStatus)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        >
                          <option value="budget_available">{t("q_budget_available")}</option>
                          <option value="financing_needed">{t("q_budget_financing")}</option>
                          <option value="budget_not_defined">{t("q_budget_undefined")}</option>
                          <option value="not_discussed">{t("q_budget_not_discussed")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">
                          {t("q_decision_authority")}
                        </label>
                        <select
                          value={decisionRole}
                          onChange={(e) => setDecisionRole(e.target.value as DecisionRole)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        >
                          <option value="owner">{t("q_owner")}</option>
                          <option value="decision_maker">{t("q_decision_maker")}</option>
                          <option value="purchasing_manager">{t("q_purchasing")}</option>
                          <option value="technical_evaluator">{t("q_technical")}</option>
                          <option value="influencer">{t("q_influencer")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer with Save Lead Action */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t("cancel")}
              </button>

              <button
                type="submit"
                disabled={isSaving || !fullName.trim() || !phone.trim() || (!!duplicateLead && !bypassDuplicate)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-falcon-600 to-falcon-500 hover:from-falcon-500 hover:to-falcon-400 text-white font-bold text-sm shadow-lg shadow-falcon-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
