import {
  Lead,
  LeadTemperature,
  ScoreItem,
  PurchaseTimeline,
  PurchaseIntent,
  BudgetStatus,
  FactoryStatus,
} from "@/types/crm";

export interface ScoreResult {
  score: number;
  temperature: LeadTemperature;
  breakdown: ScoreItem[];
}

export function calculateLeadScore(
  data: Partial<Lead>,
  isArabic = false
): ScoreResult {
  let score = 0;
  const breakdown: ScoreItem[] = [];

  // 1. Purchase Timeline (Max 30)
  const timeline = data.purchase_timeline as PurchaseTimeline;
  if (timeline === "within_30_days") {
    score += 30;
    breakdown.push({
      criterion: isArabic ? "الإطار الزمني للشراء" : "Purchase Timeline",
      points: 30,
      reason: isArabic ? "الشراء خلال 30 يوماً (عاجل جداً)" : "Ready within 30 days (High Urgency)",
    });
  } else if (timeline === "1_3_months") {
    score += 25;
    breakdown.push({
      criterion: isArabic ? "الإطار الزمني للشراء" : "Purchase Timeline",
      points: 25,
      reason: isArabic ? "الشراء خلال 1 إلى 3 أشهر" : "Targeting purchase in 1–3 months",
    });
  } else if (timeline === "3_6_months") {
    score += 15;
    breakdown.push({
      criterion: isArabic ? "الإطار الزمني للشراء" : "Purchase Timeline",
      points: 15,
      reason: isArabic ? "الشراء خلال 3 إلى 6 أشهر" : "Targeting purchase in 3–6 months",
    });
  } else if (timeline === "6_12_months") {
    score += 8;
    breakdown.push({
      criterion: isArabic ? "الإطار الزمني للشراء" : "Purchase Timeline",
      points: 8,
      reason: isArabic ? "شراء مستقبلي خلال 6 إلى 12 شهراً" : "Long-term purchase in 6–12 months",
    });
  } else {
    breakdown.push({
      criterion: isArabic ? "الإطار الزمني للشراء" : "Purchase Timeline",
      points: 0,
      reason: isArabic ? "الإطار الزمني غير محدد" : "Timeline unknown or not specified",
    });
  }

  // 2. Purchase Intent (Max 25)
  const intent = data.purchase_intent as PurchaseIntent;
  if (intent === "ready_to_buy") {
    score += 25;
    breakdown.push({
      criterion: isArabic ? "جدية ونية الشراء" : "Purchase Intent",
      points: 25,
      reason: isArabic ? "جاهز للشراء فوراً بموافقة نهائية" : "Ready to buy immediately",
    });
  } else if (intent === "comparing_options") {
    score += 15;
    breakdown.push({
      criterion: isArabic ? "جدية ونية الشراء" : "Purchase Intent",
      points: 15,
      reason: isArabic ? "يقارن بين العروض والمنافسين" : "Active comparison between manufacturers",
    });
  } else if (intent === "planning_future") {
    score += 10;
    breakdown.push({
      criterion: isArabic ? "جدية ونية الشراء" : "Purchase Intent",
      points: 10,
      reason: isArabic ? "يخطط للتوسع في المستقبل" : "Planning future expansion",
    });
  } else {
    breakdown.push({
      criterion: isArabic ? "جدية ونية الشراء" : "Purchase Intent",
      points: 0,
      reason: isArabic ? "استفسار واهتمام عام" : "General booth exploration",
    });
  }

  // 3. Budget Status (Max 15)
  const budget = data.budget_status as BudgetStatus;
  if (budget === "budget_available") {
    score += 15;
    breakdown.push({
      criterion: isArabic ? "الميزانية والتمويل" : "Budget Readiness",
      points: 15,
      reason: isArabic ? "السيولة أو الميزانية المالية جاهزة" : "Dedicated budget available",
    });
  } else if (budget === "financing_needed") {
    score += 10;
    breakdown.push({
      criterion: isArabic ? "الميزانية والتمويل" : "Budget Readiness",
      points: 10,
      reason: isArabic ? "بحاجة لتمويل بنكي أو تقسيط ميسر" : "Financing or installments requested",
    });
  } else if (budget === "budget_not_defined") {
    score += 5;
    breakdown.push({
      criterion: isArabic ? "الميزانية والتمويل" : "Budget Readiness",
      points: 5,
      reason: isArabic ? "الميزانية لم تحدد بدقة بعد" : "Budget not yet formally allocated",
    });
  } else {
    breakdown.push({
      criterion: isArabic ? "الميزانية والتمويل" : "Budget Readiness",
      points: 0,
      reason: isArabic ? "لم يتم التطرق للجانب المالي" : "Financials not discussed",
    });
  }

  // 4. Machine Interest (Max 10)
  const machineIds = data.interested_machine_ids || [];
  const machineNames = data.interested_machine_names || [];
  if (machineIds.length > 0 || machineNames.length > 0) {
    score += 10;
    breakdown.push({
      criterion: isArabic ? "تحديد الماكينة المطلوبة" : "Machine Interest",
      points: 10,
      reason: isArabic
        ? `ماكينة محددة (${machineNames.join(", ") || "تم الاختيار"})`
        : `Specific model identified (${machineNames.join(", ") || "Selected"})`,
    });
  } else {
    breakdown.push({
      criterion: isArabic ? "تحديد الماكينة المطلوبة" : "Machine Interest",
      points: 0,
      reason: isArabic ? "لم يتم تحديد طراز معين" : "No specific machine model selected",
    });
  }

  // 5. Business Status (Max 10)
  const factory = data.factory_status as FactoryStatus;
  if (factory === "yes") {
    score += 10;
    breakdown.push({
      criterion: isArabic ? "حالة المصنع والورشة" : "Business Infrastructure",
      points: 10,
      reason: isArabic ? "مصنع قائم وعامل بنشاط صناعي" : "Operational factory / active production",
    });
  } else if (factory === "under_construction") {
    score += 8;
    breakdown.push({
      criterion: isArabic ? "حالة المصنع والورشة" : "Business Infrastructure",
      points: 8,
      reason: isArabic ? "المصنع قيد التجهيز والإنشاء" : "Factory under construction / outfitting",
    });
  } else if (factory === "planning") {
    score += 5;
    breakdown.push({
      criterion: isArabic ? "حالة المصنع والورشة" : "Business Infrastructure",
      points: 5,
      reason: isArabic ? "في مرحلة التخطيط المبدئي" : "Project in feasibility / planning stage",
    });
  } else {
    breakdown.push({
      criterion: isArabic ? "حالة المصنع والورشة" : "Business Infrastructure",
      points: 0,
      reason: isArabic ? "لا توجد ورشة أو مصنع حالي" : "No active business facility",
    });
  }

  // Clamp 0..100
  score = Math.min(100, Math.max(0, score));

  // Lead Temperature mapping:
  // HOT: 70–100
  // WARM: 40–69
  // COLD: 0–39
  let temperature: LeadTemperature = "COLD";
  if (score >= 70) {
    temperature = "HOT";
  } else if (score >= 40) {
    temperature = "WARM";
  }

  return {
    score,
    temperature,
    breakdown,
  };
}
