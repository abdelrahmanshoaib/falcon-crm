"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import {
  Settings,
  Globe,
  Shield,
  MessageCircle,
  Cpu,
  RefreshCw,
  Save,
  Check,
  Building,
  Key,
} from "lucide-react";

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { currentUser, currentRole, switchRole } = useAuth();

  const [companyName, setCompanyName] = useState("Falcon CNC Machinery");
  const [whatsappPhone, setWhatsappPhone] = useState(
    process.env.NEXT_PUBLIC_FALCON_WHATSAPP_PHONE || "201001112233"
  );
  const [hotThreshold, setHotThreshold] = useState(70);
  const [warmThreshold, setWarmThreshold] = useState(40);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-falcon-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("settings_title")}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Falcon CNC company defaults, lead scoring thresholds, and WhatsApp numbers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* 2. GENERAL SETTINGS */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-falcon-400" />
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t("settings_language")}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                <option value="en">English (LTR)</option>
                <option value="ar">العربية (Arabic - RTL)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. WHATSAPP CLICK-TO-CHAT CONFIGURATION */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
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
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              All dynamic QR codes and Click-to-Chat links generated at exhibition stands will target this verified WhatsApp account.
            </span>
          </div>
        </div>

        {/* 4. SCORING THRESHOLDS */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-falcon-400" />
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 5. DATABASE & DEMO DATA RESET */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
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
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors font-semibold"
          >
            Reset Exhibition Demo Data
          </button>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-falcon-600 hover:bg-falcon-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
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
    </div>
  );
}
