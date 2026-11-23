"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import { UserRole } from "@/types/crm";
import { Shield, Database, RefreshCw, Globe, Wifi, WifiOff } from "lucide-react";

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
    <div className="bg-industrial-900 border-b border-industrial-800 text-white text-xs px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1 font-semibold text-falcon-400">
          <Shield className="w-3.5 h-3.5 text-falcon-400" />
          <span className="hidden sm:inline">Falcon CNC</span>
          <span className="text-industrial-400">|</span>
        </div>

        {/* Persistence Status */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-industrial-850 border border-industrial-700/60">
          <Database
            className={`w-3 h-3 ${isRealSupabase ? "text-emerald-400" : "text-amber-400"}`}
          />
          <span className="text-[11px] text-industrial-300">
            {isRealSupabase ? "Supabase Live" : "Exhibition Offline/Local Store"}
          </span>
        </div>

        {/* Network status */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-industrial-400">
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <WifiOff className="w-3 h-3" /> Offline (Draft Mode)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Role Switcher */}
        <div className="flex items-center gap-1 bg-industrial-950 p-0.5 rounded-md border border-industrial-800">
          <span className="text-[10px] text-industrial-400 px-1 hidden lg:inline">
            Role:
          </span>
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                currentRole === r.role
                  ? "bg-falcon-600 text-white shadow-sm"
                  : "text-industrial-300 hover:text-white hover:bg-industrial-800"
              }`}
            >
              {language === "ar" ? r.labelAr : r.labelEn}
            </button>
          ))}
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2 py-1 rounded bg-industrial-800 hover:bg-industrial-700 text-industrial-200 transition-colors"
          title="Switch Language / تبديل اللغة"
        >
          <Globe className="w-3 h-3 text-falcon-400" />
          <span className="font-semibold">{language === "en" ? "عربي" : "EN"}</span>
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
          className="flex items-center gap-1 px-1.5 py-1 text-industrial-400 hover:text-rose-400 transition-colors"
          title="Reset Sample Data"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden xl:inline text-[10px]">Reset Sample</span>
        </button>
      </div>
    </div>
  );
}
