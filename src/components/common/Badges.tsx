"use client";

import React from "react";
import { LeadTemperature, SalesStage } from "@/types/crm";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Flame, ThermometerSun, Snowflake } from "lucide-react";

export function TemperatureBadge({
  temperature,
  score,
  onClick,
  className,
}: {
  temperature: LeadTemperature;
  score?: number;
  onClick?: () => void;
  className?: string;
}) {
  const { language } = useLanguage();

  const config = {
    HOT: {
      bg: "bg-gradient-to-r from-red-500/20 via-red-950/30 to-red-500/10 border-red-500/40 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]",
      icon: Flame,
      labelEn: "HOT",
      labelAr: "ساخن",
      indicator: "bg-red-500",
    },
    WARM: {
      bg: "bg-gradient-to-r from-amber-500/20 via-amber-950/30 to-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
      icon: ThermometerSun,
      labelEn: "WARM",
      labelAr: "متوسط",
      indicator: "bg-amber-500",
    },
    COLD: {
      bg: "bg-gradient-to-r from-cyan-500/20 via-cyan-950/30 to-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]",
      icon: Snowflake,
      labelEn: "COLD",
      labelAr: "بارد",
      indicator: "bg-cyan-500",
    },
  }[temperature] || {
    bg: "bg-slate-500/15 border-slate-500/30 text-slate-300",
    icon: Snowflake,
    labelEn: temperature,
    labelAr: temperature,
    indicator: "bg-slate-500",
  };

  const Icon = config.icon;
  const label = language === "ar" ? config.labelAr : config.labelEn;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all select-none",
        config.bg,
        onClick && "hover:brightness-110 active:scale-95 cursor-pointer",
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
      {score !== undefined && (
        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 border border-white/10 ml-0.5 text-white">
          {score}
        </span>
      )}
    </button>
  );
}

export function StageBadge({
  stage,
  className,
}: {
  stage: SalesStage;
  className?: string;
}) {
  const { t } = useLanguage();

  const stageStyles: Record<SalesStage, { bg: string; text: string; border: string }> = {
    new_lead: { bg: "bg-slate-500/15", text: "text-slate-300", border: "border-slate-500/30" },
    contacted: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/30" },
    qualified: { bg: "bg-indigo-500/15", text: "text-indigo-300", border: "border-indigo-500/30" },
    consultation: { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30" },
    quotation_sent: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
    negotiation: { bg: "bg-orange-500/15", text: "text-orange-300", border: "border-orange-500/30" },
    won: { bg: "bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.25)]", text: "text-emerald-300 font-bold", border: "border-emerald-500/40" },
    lost: { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/30" },
    on_hold: { bg: "bg-zinc-500/15", text: "text-zinc-300", border: "border-zinc-500/30" },
  };

  const style = stageStyles[stage] || stageStyles.new_lead;
  const stageKey = `stage_${stage}` as keyof typeof import("@/lib/i18n").translations.en;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {t(stageKey)}
    </span>
  );
}
