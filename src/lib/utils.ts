import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes phone numbers:
 * Removes spaces, parentheses, hyphens, and standardizes local Egyptian numbers (e.g., 010... -> +2010...)
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, "");
  // If starts with 00, replace with +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  // If starts with Egyptian local 01X, prefix with +2
  if (/^01[0125]\d{8}$/.test(cleaned)) {
    cleaned = "+2" + cleaned;
  }
  // If starts with 201X without +, add +
  if (/^201[0125]\d{8}$/.test(cleaned)) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

/**
 * Formats a number as currency (e.g. $25,000 or EGP)
 */
export function formatCurrency(amount: number, currency: "USD" | "EGP" = "USD"): string {
  if (isNaN(amount)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats relative time (e.g. '2 hours ago', 'tomorrow')
 */
export function formatRelativeTime(dateString: string, isArabic = false): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffMinutes) < 60) {
      if (diffMinutes === 0) return isArabic ? "الآن" : "Just now";
      if (diffMinutes > 0) return isArabic ? `خلال ${diffMinutes} دقيقة` : `In ${diffMinutes}m`;
      return isArabic ? `منذ ${Math.abs(diffMinutes)} دقيقة` : `${Math.abs(diffMinutes)}m ago`;
    }

    if (Math.abs(diffHours) < 24) {
      if (diffHours > 0) return isArabic ? `خلال ${diffHours} ساعة` : `In ${diffHours}h`;
      return isArabic ? `منذ ${Math.abs(diffHours)} ساعة` : `${Math.abs(diffHours)}h ago`;
    }

    if (Math.abs(diffDays) < 7) {
      if (diffDays === 1) return isArabic ? "غداً" : "Tomorrow";
      if (diffDays === -1) return isArabic ? "أمس" : "Yesterday";
      if (diffDays > 0) return isArabic ? `خلال ${diffDays} أيام` : `In ${diffDays}d`;
      return isArabic ? `منذ ${Math.abs(diffDays)} أيام` : `${Math.abs(diffDays)}d ago`;
    }

    return date.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}
