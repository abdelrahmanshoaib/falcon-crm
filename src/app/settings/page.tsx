"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { UserProfile } from "@/types/crm";
import { AddEmployeeModal } from "@/components/team/AddEmployeeModal";
import {
  Settings,
  MessageCircle,
  Cpu,
  RefreshCw,
  Save,
  Check,
  Building,
  UserPlus,
  Crown,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const isAr = language === "ar";
  const { currentUser, currentRole, can, refreshProfiles } = useAuth();
  const canManageStaff = can("manage_admins") || currentRole === "admin" || currentRole === "manager";

  useEffect(() => {
    if (currentRole === "sales_rep") {
      router.push("/leads");
    }
  }, [currentRole, router]);

  const [companyName, setCompanyName] = useState("Falcon CNC Machinery");
  const [whatsappPhone, setWhatsappPhone] = useState(
    process.env.NEXT_PUBLIC_FALCON_WHATSAPP_PHONE || "201001112233"
  );
  const [hotThreshold, setHotThreshold] = useState(70);
  const [warmThreshold, setWarmThreshold] = useState(40);
  const [isSaved, setIsSaved] = useState(false);

  // Employee modal state for Super Admin
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    db.getProfiles().then((profs) => {
      setEmployeeCount(profs.length);
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleEmployeeSaved = (saved: UserProfile) => {
    setEmployeeCount((prev) => prev + 1);
    if (refreshProfiles) refreshProfiles();
  };

  return (
    <div className="space-y-5 max-w-4xl pb-20 sm:pb-8">
      {/* 1. HEADER */}
      <div className="relative rounded-3xl p-5 sm:p-6 glass-panel border border-white/10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/15">
                <Settings className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t("settings_title")}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? "إعدادات شركة فالكون، حدود تقييم الفرص، تكامل واتساب، وإدارة الكادر والموظفين"
                    : "Configure Falcon CNC defaults, lead scoring thresholds, WhatsApp, and staff."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EMPLOYEE MANAGEMENT CARD (Admin & Manager) */}
      {canManageStaff && (
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-amber-500/30 relative overflow-hidden space-y-4 shadow-xl">
          {/* Top highlight bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-md shadow-amber-500/15">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {isAr ? "إدارة الموظفين والكوادر (سوبر أدمن)" : "Staff & Employee Management (Super Admin)"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {isAr ? "سوبر أدمن" : "Super Admin"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? `لديك حالياً ${employeeCount} موظف مسجل. يمكنك إضافة موظف جديد أو إدارة الفريق وصلاحياته بالكامل.`
                    : `You have ${employeeCount} registered staff. Provision new members or configure role access.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t("add_employee")}</span>
              </button>

              <Link
                href="/team"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl glass-pill text-white hover:text-cyan-300 font-semibold text-xs border border-white/10 hover:border-cyan-400/30 transition-all"
              >
                <span>{isAr ? "عرض الفريق" : "View Team"}</span>
                {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </Link>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* 3. GENERAL SETTINGS */}
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-white/10 space-y-3.5">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>{t("settings_general")}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-white outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t("settings_language")}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full glass-input rounded-xl p-2.5 text-white outline-none focus:ring-1 focus:ring-cyan-400/50 bg-[#090f20]"
              >
                <option value="en">English (LTR)</option>
                <option value="ar">العربية (Arabic - RTL)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. WHATSAPP CLICK-TO-CHAT CONFIGURATION */}
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-white/10 space-y-3.5">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Click-to-Chat Integration</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {t("settings_whatsapp_number")}
            </label>
            <input
              type="text"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="e.g. 201001112233 (Country code + mobile without +)"
              className="w-full glass-input rounded-xl p-2.5 text-white font-mono outline-none focus:ring-1 focus:ring-cyan-400/50"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              All dynamic QR codes and Click-to-Chat links generated at exhibition stands will target this verified WhatsApp account.
            </span>
          </div>
        </div>

        {/* 5. SCORING THRESHOLDS */}
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-white/10 space-y-3.5">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Lead Scoring & Temperature Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                HOT Threshold (Points: {hotThreshold} to 100)
              </label>
              <input
                type="number"
                value={hotThreshold}
                onChange={(e) => setHotThreshold(Number(e.target.value))}
                className="w-full glass-input rounded-xl p-2.5 text-white font-mono outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                WARM Threshold (Points: {warmThreshold} to {hotThreshold - 1})
              </label>
              <input
                type="number"
                value={warmThreshold}
                onChange={(e) => setWarmThreshold(Number(e.target.value))}
                className="w-full glass-input rounded-xl p-2.5 text-white font-mono outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
          </div>
        </div>

        {/* 6. DATABASE & DEMO DATA RESET */}
        <div className="p-5 sm:p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Exhibition Data Reset</span>
          </h3>

          <p className="text-slate-400 leading-relaxed text-xs">
            If you need to purge test leads or reload the clean initial Cairo WoodShow & MacTech demo records, click below.
          </p>

          <button
            type="button"
            onClick={() => {
              if (confirm("Reset demo data to factory defaults?")) {
                db.resetDemoData();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-colors font-semibold"
          >
            Reset Exhibition Demo Data
          </button>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-falcon-500 hover:from-cyan-400 hover:to-falcon-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save System Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Super Admin Employee Modal */}
      <AddEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSaved={handleEmployeeSaved}
      />
    </div>
  );
}
