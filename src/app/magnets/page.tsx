"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { SalesMagnet } from "@/types/crm";
import { SalesMagnetCard } from "@/components/magnets/SalesMagnetCard";
import { WhatsAppQRModal } from "@/components/whatsapp/WhatsAppQRModal";
import { Magnet, Plus, Filter, Search, Sparkles } from "lucide-react";

export default function MagnetsPage() {
  const { t } = useLanguage();
  const { can } = useAuth();

  const [magnets, setMagnets] = useState<SalesMagnet[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  // QR Modal
  const [selectedMagnetForQR, setSelectedMagnetForQR] = useState<SalesMagnet | null>(null);

  useEffect(() => {
    db.getSalesMagnets().then(setMagnets);
  }, []);

  const filtered = magnets.filter((m) => {
    if (categoryFilter !== "all" && m.category !== categoryFilter) return false;
    if (
      search &&
      !m.title.toLowerCase().includes(search.toLowerCase()) &&
      !m.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const categories = ["all", "Guide", "Catalog", "Calculator", "Checklist", "Demo Video"];

  return (
    <div className="space-y-5">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Magnet className="w-5 h-5 text-falcon-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("magnet_library_title")}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t("magnet_library_subtitle")}
          </p>
        </div>

        {can("manage_magnets") && (
          <button
            onClick={() => alert("Upload resource modal")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-falcon-600 hover:bg-falcon-500 text-white font-semibold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Resource</span>
          </button>
        )}
      </div>

      {/* 2. FILTER & CATEGORY CHIPS */}
      <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-falcon-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat === "all" ? "All Formats" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides, calculators..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs text-white focus:outline-none focus:border-falcon-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* 3. MAGNET CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((magnet) => (
          <SalesMagnetCard
            key={magnet.id}
            magnet={magnet}
            onGenerateQR={(mag) => setSelectedMagnetForQR(mag)}
          />
        ))}
      </div>

      {/* WHATSAPP QR MODAL FOR THIS MAGNET */}
      <WhatsAppQRModal
        isOpen={Boolean(selectedMagnetForQR)}
        onClose={() => setSelectedMagnetForQR(null)}
        preselectedMagnet={selectedMagnetForQR}
      />
    </div>
  );
}
