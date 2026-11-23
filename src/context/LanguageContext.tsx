"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  direction: "ltr" | "rtl";
  t: (key: keyof typeof translations.en) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("falcon_crm_language") as Language;
    if (saved === "en" || saved === "ar") {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    localStorage.setItem("falcon_crm_language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (key: keyof typeof translations.en): string => {
    const dict = translations[language] || translations.en;
    return (dict as any)[key] || (translations.en as any)[key] || key;
  };

  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider
      value={{ language, direction, t, setLanguage, toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
