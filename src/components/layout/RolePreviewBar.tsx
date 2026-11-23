"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import { UserRole } from "@/types/crm";
import { Shield, Database, RefreshCw, Globe, Wifi, WifiOff, Sparkles } from "lucide-react";

export function RolePreviewBar() {
  const { currentUser, currentRole, switchRole } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const isRealSupabase = db.isRealSupabase();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const roles: { role: UserRole; labelEn: string; labelAr: string }[] = [
    { role: "admin", labelEn: "Admin", labelAr: "المدير العام" },
    { role: "manager", labelEn: "Sales Manager", labelAr: "مدير المبيعات" },
    { role: "sales_rep", labelEn: "Sales Rep", labelAr: "مندوب مبيعات" },
  ];

  return (
    <div className="bg-[#050916]/90 border-b border-white/10 text-white text-xs px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 z-40 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-bold text-cyan-400">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline font-mono tracking-wider">FALCON CNC</span>
          <span className="text-white/20">|</span>
        </div>

        {/* Persistence Status */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] sm:text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              isRealSupabase ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
            }`}
          />
          <span className="text-slate-300 font-medium truncate max-w-[140px] sm:max-w-none">
            {isRealSupabase ? "Supabase Live" : "Exhibition Offline Store"}
          </span>
        </div>

        {/* Network status */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <WifiOff className="w-3 h-3" /> Offline (Draft)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Role Switcher */}
        <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-xl border border-white/10">
          <span className="text-[10px] text-slate-400 px-1.5 hidden lg:inline font-mono">
            Role:
          </span>
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all ${
                currentRole === r.role
                  ? "bg-gradient-to-r from-falcon-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.4)] border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {language === "ar" ? r.labelAr : r.labelEn}
            </button>
          ))}
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl glass-pill text-slate-200 hover:text-white text-xs font-bold transition-all active:scale-95"
          title="Switch Language / تبديل اللغة"
        >
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>{language === "en" ? "عربي" : "EN"}</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (
              confirm(
                language === "ar"
                  ? "هل تريد إعادة ضبط بيانات المعرض التجريبية للوضع الافتراضي؟"
                  : "Reset exhibition sample data to defaults?"
              )
            ) {
              db.resetDemoData();
            }
          }}
          className="flex items-center gap-1 p-1 sm:px-1.5 sm:py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Reset Sample Data"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden xl:inline text-[10px]">Reset</span>
        </button>
      </div>
    </div>
  );
}
