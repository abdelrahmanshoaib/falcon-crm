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
      bg: "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400",
      icon: Flame,
      labelEn: "HOT",
      labelAr: "ساخن",
      indicator: "bg-red-500",
    },
    WARM: {
      bg: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
      icon: ThermometerSun,
      labelEn: "WARM",
      labelAr: "متوسط",
      indicator: "bg-amber-500",
    },
    COLD: {
      bg: "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400",
      icon: Snowflake,
      labelEn: "COLD",
      labelAr: "بارد",
      indicator: "bg-blue-500",
    },
  }[temperature] || {
    bg: "bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-400",
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
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all select-none",
        config.bg,
        onClick && "hover:brightness-95 active:scale-95 cursor-pointer",
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
      {score !== undefined && (
        <span className="font-mono text-[10px] px-1 rounded bg-black/10 dark:bg-white/10 ml-0.5">
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
    new_lead: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", border: "border-slate-300 dark:border-slate-700" },
    contacted: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
    qualified: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800" },
    consultation: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
    quotation_sent: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
    negotiation: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
    won: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-300 dark:border-emerald-800" },
    lost: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
    on_hold: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400", border: "border-zinc-300 dark:border-zinc-700" },
  };

  const style = stageStyles[stage] || stageStyles.new_lead;
  const stageKey = `stage_${stage}` as keyof typeof import("@/lib/i18n").translations.en;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
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
