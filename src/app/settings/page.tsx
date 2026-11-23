"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import {
  UserProfile,
  Machine,
  CityOption,
  SectorOption,
  RepLeadFormCustomization,
} from "@/types/crm";
import { AddEmployeeModal } from "@/components/team/AddEmployeeModal";
import { AddMachineModal } from "@/components/settings/AddMachineModal";
import {
  Settings,
  MessageCircle,
  Cpu,
  RefreshCw,
  Save,
  Check,
  Building,
  Sparkles,
  Sliders,
  MapPin,
  Briefcase,
  Flame,
  ThermometerSun,
  Snowflake,
  Trash2,
  Edit2,
  Plus,
  Eye,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const isAr = language === "ar";
  const { currentUser, currentRole, can, refreshProfiles } = useAuth();
  const canManageStaff = can("manage_admins") || currentRole === "admin" || currentRole === "manager";

  // Active Tab
  const [activeTab, setActiveTab] = useState<"metadata" | "customization" | "general">("metadata");

  // Protection: sales reps redirected to leads
  useEffect(() => {
    if (currentRole === "sales_rep") {
      router.push("/leads");
    }
  }, [currentRole, router]);

  // System general settings state
  const [companyName, setCompanyName] = useState("Falcon CNC Machinery");
  const [whatsappPhone, setWhatsappPhone] = useState(
    process.env.NEXT_PUBLIC_FALCON_WHATSAPP_PHONE || "201001112233"
  );
  const [hotThreshold, setHotThreshold] = useState(70);
  const [warmThreshold, setWarmThreshold] = useState(40);
  const [isSavedGeneral, setIsSavedGeneral] = useState(false);

  // Employee modal state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  // 1. Fixed Metadata States (Machines, Cities, Sectors)
  const [machines, setMachines] = useState<Machine[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [sectors, setSectors] = useState<SectorOption[]>([]);

  // Machine Modal
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // New City Input
  const [newCityEn, setNewCityEn] = useState("");
  const [newCityAr, setNewCityAr] = useState("");

  // New Sector Input
  const [newSectorEn, setNewSectorEn] = useState("");
  const [newSectorAr, setNewSectorAr] = useState("");

  // 2. Rep Customization State
  const [selectedRepId, setSelectedRepId] = useState<string>("");
  const [allCustomizations, setAllCustomizations] = useState<Record<string, RepLeadFormCustomization>>({});
  const [repCustomForm, setRepCustomForm] = useState<RepLeadFormCustomization>({
    rep_id: "",
    default_machine_name: "",
    default_city: "Damietta",
    default_temperature: "HOT",
    default_sector: "Furniture & Millwork",
    show_company_name: true,
    show_city: true,
    show_interested_machine: true,
    show_temperature: true,
    show_quick_notes: true,
    show_qualification_section: true,
    default_form_mode: "compact",
    quick_note_presets: [],
  });

  const [newPresetNote, setNewPresetNote] = useState("");
  const [isSavedCustomization, setIsSavedCustomization] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    Promise.all([
      db.getProfiles(),
      db.getMachines(),
      db.getCities(),
      db.getSectors(),
      db.getAllRepCustomizations(),
    ]).then(([profs, machList, cityList, secList, customs]) => {
      setProfiles(profs);
      setMachines(machList);
      setCities(cityList);
      setSectors(secList);
      setAllCustomizations(customs);

      // Select first sales rep or current user by default for customization tab
      const targetRep = profs.find((p) => p.role === "sales_rep") || profs[0];
      if (targetRep) {
        setSelectedRepId(targetRep.id);
        const existing = customs[targetRep.id];
        if (existing) {
          setRepCustomForm(existing);
        } else {
          setRepCustomForm({
            rep_id: targetRep.id,
            default_machine_name: machList[0]?.name || "",
            default_city: cityList[0]?.name_en || "Damietta",
            default_temperature: "HOT",
            default_sector: secList[0]?.name_en || "Furniture & Millwork",
            show_company_name: true,
            show_city: true,
            show_interested_machine: true,
            show_temperature: true,
            show_quick_notes: true,
            show_qualification_section: true,
            default_form_mode: "compact",
            quick_note_presets: [
              "مهتم بالتقسيط المباشر 12 شهر",
              "يحتاج معاينة في المعرض غداً",
              "طلب عرض سعر رسمي فوري",
            ],
          });
        }
      }
    });
  }, []);

  // When selected rep changes in customization tab
  const handleSelectRep = (repId: string) => {
    setSelectedRepId(repId);
    const existing = allCustomizations[repId];
    if (existing) {
      setRepCustomForm(existing);
    } else {
      setRepCustomForm({
        rep_id: repId,
        default_machine_name: machines[0]?.name || "",
        default_city: cities[0]?.name_en || "Damietta",
        default_temperature: "HOT",
        default_sector: sectors[0]?.name_en || "Furniture & Millwork",
        show_company_name: true,
        show_city: true,
        show_interested_machine: true,
        show_temperature: true,
        show_quick_notes: true,
        show_qualification_section: true,
        default_form_mode: "compact",
        quick_note_presets: [
          "مهتم بالتقسيط المباشر 12 شهر",
          "يحتاج معاينة في المعرض غداً",
          "طلب عرض سعر رسمي فوري",
        ],
      });
    }
  };

  // ----------------------------------------------------
  // MACHINE ACTIONS
  // ----------------------------------------------------
  const handleSaveMachine = async (machine: Machine) => {
    const exists = machines.some((m) => m.id === machine.id);
    if (exists) {
      const updated = await db.updateMachine(machine.id, machine);
      if (updated) {
        setMachines((prev) => prev.map((m) => (m.id === machine.id ? updated : m)));
      }
    } else {
      const created = await db.createMachine(machine);
      setMachines((prev) => [created, ...prev]);
    }
  };

  const handleToggleMachineActive = async (m: Machine) => {
    const updated = await db.updateMachine(m.id, { is_active: !m.is_active });
    if (updated) {
      setMachines((prev) => prev.map((item) => (item.id === m.id ? updated : item)));
    }
  };

  const handleDeleteMachine = async (m: Machine) => {
    if (!confirm(isAr ? `هل تريد حذف ماكينة "${m.name}"؟` : `Delete machine "${m.name}"?`)) return;
    const ok = await db.deleteMachine(m.id);
    if (ok) {
      setMachines((prev) => prev.filter((item) => item.id !== m.id));
    }
  };

  // ----------------------------------------------------
  // CITY ACTIONS
  // ----------------------------------------------------
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityEn.trim() && !newCityAr.trim()) return;

    const newCityObj: CityOption = {
      id: `c-${Date.now()}`,
      name_en: newCityEn.trim() || newCityAr.trim(),
      name_ar: newCityAr.trim() || newCityEn.trim(),
      is_active: true,
    };

    const updated = [...cities, newCityObj];
    setCities(updated);
    await db.saveCities(updated);
    setNewCityEn("");
    setNewCityAr("");
  };

  const handleDeleteCity = async (cityId: string) => {
    const updated = cities.filter((c) => c.id !== cityId);
    setCities(updated);
    await db.saveCities(updated);
  };

  const handleToggleCity = async (cityId: string) => {
    const updated = cities.map((c) => (c.id === cityId ? { ...c, is_active: !c.is_active } : c));
    setCities(updated);
    await db.saveCities(updated);
  };

  // ----------------------------------------------------
  // SECTOR ACTIONS
  // ----------------------------------------------------
  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorEn.trim() && !newSectorAr.trim()) return;

    const newSecObj: SectorOption = {
      id: `sec-${Date.now()}`,
      name_en: newSectorEn.trim() || newSectorAr.trim(),
      name_ar: newSectorAr.trim() || newSectorEn.trim(),
      is_active: true,
    };

    const updated = [...sectors, newSecObj];
    setSectors(updated);
    await db.saveSectors(updated);
    setNewSectorEn("");
    setNewSectorAr("");
  };

  const handleDeleteSector = async (secId: string) => {
    const updated = sectors.filter((s) => s.id !== secId);
    setSectors(updated);
    await db.saveSectors(updated);
  };

  // ----------------------------------------------------
  // REP CUSTOMIZATION ACTIONS
  // ----------------------------------------------------
  const handleAddPresetNote = () => {
    if (!newPresetNote.trim()) return;
    const presets = repCustomForm.quick_note_presets || [];
    if (!presets.includes(newPresetNote.trim())) {
      setRepCustomForm({
        ...repCustomForm,
        quick_note_presets: [...presets, newPresetNote.trim()],
      });
    }
    setNewPresetNote("");
  };

  const handleDeletePresetNote = (noteText: string) => {
    setRepCustomForm({
      ...repCustomForm,
      quick_note_presets: (repCustomForm.quick_note_presets || []).filter((n) => n !== noteText),
    });
  };

  const handleSaveCustomization = async () => {
    if (!selectedRepId) return;
    await db.saveRepCustomization(selectedRepId, repCustomForm);
    setAllCustomizations((prev) => ({ ...prev, [selectedRepId]: repCustomForm }));
    setIsSavedCustomization(true);
    setTimeout(() => setIsSavedCustomization(false), 2500);
  };

  const handleResetCustomizationDefaults = () => {
    const defaultCustom: RepLeadFormCustomization = {
      rep_id: selectedRepId,
      default_machine_name: machines[0]?.name || "",
      default_city: cities[0]?.name_en || "Damietta",
      default_temperature: "HOT",
      default_sector: sectors[0]?.name_en || "Furniture & Millwork",
      show_company_name: true,
      show_city: true,
      show_interested_machine: true,
      show_temperature: true,
      show_quick_notes: true,
      show_qualification_section: true,
      default_form_mode: "compact",
      quick_note_presets: [
        "مهتم بالتقسيط المباشر 12 شهر",
        "يحتاج معاينة في المعرض غداً",
        "طلب عرض سعر رسمي فوري",
      ],
    };
    setRepCustomForm(defaultCustom);
  };

  // ----------------------------------------------------
  // GENERAL SETTINGS SAVE
  // ----------------------------------------------------
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedGeneral(true);
    setTimeout(() => setIsSavedGeneral(false), 2500);
  };

  const selectedRepProfile = profiles.find((p) => p.id === selectedRepId);

  return (
    <div className="space-y-6 max-w-5xl pb-24 sm:pb-12">
      {/* 1. MAIN HEADER */}
      <div className="relative rounded-3xl p-5 sm:p-6 glass-panel border border-white/10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/15">
              <Settings className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t("settings_title")}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {isAr ? "تحكم الإدارة والسوبر أدمن" : "Manager/Admin Cockpit"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? "تعديل الماكينات، المدن، قطاعات الصناعة، وتخصيص واجهة إضافة العملاء لكل موظف على حدة"
                  : "Manage machines, cities, sectors, and customize lead capture layout per employee."}
              </p>
            </div>
          </div>

          <Link
            href="/team"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl glass-pill text-white hover:text-cyan-300 font-semibold text-xs border border-white/10 hover:border-cyan-400/30 transition-all self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? "إدارة الكوادر والموظفين" : "Manage Staff"}</span>
          </Link>
        </div>

        {/* 2. TABS NAVIGATOR */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/10 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("metadata")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === "metadata"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{isAr ? "البيانات الثابتة (الماكينات والمناطق)" : "Fixed Lead Metadata (Machines & Cities)"}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-mono">
              {machines.length + cities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customization")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === "customization"
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isAr ? "تخصيص واجهة الموظفين" : "Employee Form Customizer"}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-mono">
              {profiles.filter((p) => p.role === "sales_rep").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap ${
              activeTab === "general"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{isAr ? "إعدادات الشركة وواتساب" : "General & WhatsApp"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FIXED LEAD REGISTRATION METADATA (MACHINES, CITIES, SECTORS)      */}
      {/* ========================================================================= */}
      {activeTab === "metadata" && (
        <div className="space-y-6">
          {/* SECTION 1.1: MACHINES CATALOG */}
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {isAr ? "كتالوج الماكينات ومعدات العرض" : "Machines & Equipment Catalog"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr
                      ? "إضافة وتعديل وحذف أنواع الماكينات المتاحة لمندوبي المبيعات في نموذج تسجيل العملاء"
                      : "Add, edit, and toggle machines available for sales reps during booth capture."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingMachine(null);
                  setIsMachineModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-falcon-500 hover:from-cyan-400 hover:to-falcon-400 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? "إضافة ماكينة جديدة" : "Add New Machine"}</span>
              </button>
            </div>

            {/* Machines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {machines.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl border transition-all flex gap-3 relative overflow-hidden group ${
                    m.is_active
                      ? "bg-white/[0.03] border-white/10 hover:border-cyan-400/40"
                      : "bg-black/40 border-rose-500/20 opacity-70"
                  }`}
                >
                  <img
                    src={m.image_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500"}
                    alt={m.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                          {m.category}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            m.is_active
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {m.is_active ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Disabled")}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-1">
                        {m.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {m.model} {m.price_range && `• ${m.price_range}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 mt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleMachineActive(m)}
                        className={`text-[10px] px-2 py-1 rounded-lg font-semibold transition-all ${
                          m.is_active
                            ? "bg-slate-800 text-slate-300 hover:text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {m.is_active ? (isAr ? "إيقاف مؤقت" : "Deactivate") : (isAr ? "تفعيل" : "Activate")}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingMachine(m);
                          setIsMachineModalOpen(true);
                        }}
                        className="text-[10px] px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>{isAr ? "تعديل" : "Edit"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMachine(m)}
                        className="text-[10px] p-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 1.2: CITIES & GEOGRAPHIC REGIONS */}
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {isAr ? "المناطق والمحافظات الجغرافية (Cities & Regions)" : "Cities & Geographic Regions"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? "تحديد المدن والمحافظات المتاحة للاختيار عند تسجيل عميل جديد بالمعرض"
                    : "Configure selectable locations for quick lead registration."}
                </p>
              </div>
            </div>

            {/* Add New City Input */}
            <form onSubmit={handleAddCity} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newCityAr}
                onChange={(e) => setNewCityAr(e.target.value)}
                placeholder={isAr ? "اسم المنطقة بالعربي (مثال: العاشر من رمضان)" : "Region in Arabic"}
                className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-400/50"
              />
              <input
                type="text"
                value={newCityEn}
                onChange={(e) => setNewCityEn(e.target.value)}
                placeholder={isAr ? "اسم المنطقة بالإنجليزي (مثال: 10th of Ramadan)" : "Region in English"}
                className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-400/50"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة منطقة" : "Add City"}</span>
              </button>
            </form>

            {/* Cities Badges Roster */}
            <div className="flex flex-wrap gap-2 pt-1">
              {cities.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    c.is_active
                      ? "bg-white/[0.04] border-white/10 text-slate-200"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-300 opacity-60"
                  }`}
                >
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{isAr ? c.name_ar : c.name_en}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({isAr ? c.name_en : c.name_ar})
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleCity(c.id)}
                    className="p-1 hover:text-amber-300 transition-colors ml-1 rtl:ml-0 rtl:mr-1"
                    title={c.is_active ? "Deactivate" : "Activate"}
                  >
                    <Check className="w-2.5 h-2.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCity(c.id)}
                    className="p-1 hover:text-rose-400 transition-colors text-slate-400"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 1.3: BUSINESS SECTORS */}
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {isAr ? "قطاعات النشاط والصناعة (Business Sectors)" : "Business Sectors"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? "تحديد مجالات عمل العملاء (أثاث، مطابخ، واجهات كلادينج، تشغيل معادن...)"
                    : "Industry sectors for lead segmentation."}
                </p>
              </div>
            </div>

            {/* Add Sector Form */}
            <form onSubmit={handleAddSector} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newSectorAr}
                onChange={(e) => setNewSectorAr(e.target.value)}
                placeholder={isAr ? "اسم القطاع بالعربي (مثال: صناعة أثاث وموبيليا)" : "Sector in Arabic"}
                className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-amber-400/50"
              />
              <input
                type="text"
                value={newSectorEn}
                onChange={(e) => setNewSectorEn(e.target.value)}
                placeholder={isAr ? "اسم القطاع بالإنجليزي (مثال: Furniture & Millwork)" : "Sector in English"}
                className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-amber-400/50"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/20 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة قطاع" : "Add Sector"}</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              {sectors.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-slate-200"
                >
                  <Briefcase className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="font-semibold">{isAr ? s.name_ar : s.name_en}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSector(s.id)}
                    className="p-1 hover:text-rose-400 transition-colors text-slate-400"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EMPLOYEE LEAD CAPTURE FORM CUSTOMIZER                             */}
      {/* ========================================================================= */}
      {activeTab === "customization" && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-amber-500/30 relative overflow-hidden space-y-5 shadow-xl">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500" />

            {/* Rep Selector Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <span>{isAr ? "تخصيص واجهة إضافة العملاء لكل موظف" : "Customize Lead Capture Form Per Rep"}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? "حدد لكل موظف ماكينته الافتراضية، منطقته، الحقول الظاهرة، وقوالب الملاحظات الجاهزة بنقرة واحدة"
                    : "Configure personalized default machine, region, field visibility, and quick notes presets."}
                </p>
              </div>

              {/* Rep Dropdown Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-semibold">{isAr ? "الموظف:" : "Employee:"}</span>
                <select
                  value={selectedRepId}
                  onChange={(e) => handleSelectRep(e.target.value)}
                  className="glass-input rounded-xl px-3 py-2 text-xs text-white bg-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.full_name} ({p.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedRepProfile && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <img
                  src={selectedRepProfile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                  alt={selectedRepProfile.full_name}
                  className="w-10 h-10 rounded-xl object-cover border border-amber-400/40"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {selectedRepProfile.full_name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedRepProfile.email} • {selectedRepProfile.role}
                  </p>
                </div>
              </div>
            )}

            {/* Customization Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. Default Machine */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isAr ? "الماكينة الافتراضية (تخصص الموظف)" : "Default Machine Specialty"}
                </label>
                <select
                  value={repCustomForm.default_machine_name}
                  onChange={(e) =>
                    setRepCustomForm({ ...repCustomForm, default_machine_name: e.target.value })
                  }
                  className="w-full glass-input rounded-xl p-2.5 text-white bg-slate-900 outline-none focus:ring-1 focus:ring-amber-400/50"
                >
                  {machines
                    .filter((m) => m.is_active)
                    .map((m) => (
                      <option key={m.id} value={m.name} className="bg-slate-900">
                        {m.name} ({m.category})
                      </option>
                    ))}
                </select>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {isAr
                    ? "تفتح هذه الماكينة تلقائياً عند ضغط الموظف على زر إضافة عميل"
                    : "Automatically selected when this sales rep captures a new lead"}
                </span>
              </div>

              {/* 2. Default City */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isAr ? "المنطقة / المحافظة الافتراضية" : "Default Region/City"}
                </label>
                <select
                  value={repCustomForm.default_city}
                  onChange={(e) =>
                    setRepCustomForm({ ...repCustomForm, default_city: e.target.value })
                  }
                  className="w-full glass-input rounded-xl p-2.5 text-white bg-slate-900 outline-none focus:ring-1 focus:ring-amber-400/50"
                >
                  {cities
                    .filter((c) => c.is_active)
                    .map((c) => (
                      <option key={c.id} value={c.name_en} className="bg-slate-900">
                        {isAr ? `${c.name_ar} (${c.name_en})` : `${c.name_en} (${c.name_ar})`}
                      </option>
                    ))}
                </select>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {isAr ? "المنطقة التي يركز عليها المندوب" : "Preferred regional focus"}
                </span>
              </div>

              {/* 3. Default Temperature */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isAr ? "درجة الحرارة الافتراضية للعميل" : "Default Lead Temperature"}
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setRepCustomForm({ ...repCustomForm, default_temperature: "HOT" })
                    }
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                      repCustomForm.default_temperature === "HOT"
                        ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>HOT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRepCustomForm({ ...repCustomForm, default_temperature: "WARM" })
                    }
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                      repCustomForm.default_temperature === "WARM"
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ThermometerSun className="w-3.5 h-3.5" />
                    <span>WARM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRepCustomForm({ ...repCustomForm, default_temperature: "COLD" })
                    }
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                      repCustomForm.default_temperature === "COLD"
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>COLD</span>
                  </button>
                </div>
              </div>

              {/* 4. Form Mode (Compact <30s vs Full Survey) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {isAr ? "نمط النموذج الافتراضي" : "Default Form Mode"}
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setRepCustomForm({ ...repCustomForm, default_form_mode: "compact" })
                    }
                    className={`py-2 rounded-lg font-bold text-center transition-all ${
                      repCustomForm.default_form_mode === "compact"
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {isAr ? "خاطف وسريع (<30 ثانية)" : "Compact Fast (<30s)"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRepCustomForm({ ...repCustomForm, default_form_mode: "full" })
                    }
                    className={`py-2 rounded-lg font-bold text-center transition-all ${
                      repCustomForm.default_form_mode === "full"
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {isAr ? "استبيان تفصيلي شامل" : "Full Qualification"}
                  </button>
                </div>
              </div>
            </div>

            {/* Field Visibility Toggles for this Rep */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>{isAr ? "التحكم في ظهور الحقول في واجهة الموظف:" : "Field Visibility Toggles:"}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Show Company */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-300 font-medium">
                    {isAr ? "حقل اسم الشركة" : "Company Name"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setRepCustomForm({
                        ...repCustomForm,
                        show_company_name: !repCustomForm.show_company_name,
                      })
                    }
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      repCustomForm.show_company_name ? "bg-cyan-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        repCustomForm.show_company_name ? "translate-x-4 rtl:-translate-x-4" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Show Notes */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-300 font-medium">
                    {isAr ? "حقل الملاحظات السريعة" : "Quick Notes"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setRepCustomForm({
                        ...repCustomForm,
                        show_quick_notes: !repCustomForm.show_quick_notes,
                      })
                    }
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      repCustomForm.show_quick_notes ? "bg-cyan-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        repCustomForm.show_quick_notes ? "translate-x-4 rtl:-translate-x-4" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Show Qualification Section */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-300 font-medium">
                    {isAr ? "قسم استبيان التأهيل" : "Qualification Accordion"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setRepCustomForm({
                        ...repCustomForm,
                        show_qualification_section: !repCustomForm.show_qualification_section,
                      })
                    }
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      repCustomForm.show_qualification_section ? "bg-cyan-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        repCustomForm.show_qualification_section
                          ? "translate-x-4 rtl:-translate-x-4"
                          : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Note Presets for this Rep */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {isAr
                    ? "أزرار الملاحظات السريعة الجاهزة لهذا الموظف (بنقرة واحدة):"
                    : "One-Click Quick Note Presets for this Rep:"}
                </span>
              </h4>

              {/* Add Preset Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPresetNote}
                  onChange={(e) => setNewPresetNote(e.target.value)}
                  placeholder={
                    isAr
                      ? "اكتب ملاحظة شائعة (مثال: طلب تقسيط مباشر 12 شهر، زيارة للمصنع غداً...)"
                      : "Add preset note (e.g. Needs financing, Booth demo visit...)"
                  }
                  className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-amber-400/50"
                />
                <button
                  type="button"
                  onClick={handleAddPresetNote}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? "إضافة" : "Add"}</span>
                </button>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {(repCustomForm.quick_note_presets || []).map((preset, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200"
                  >
                    <span>{preset}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePresetNote(preset)}
                      className="p-0.5 hover:text-rose-400 text-slate-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Customization Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleResetCustomizationDefaults}
                className="px-4 py-2.5 rounded-xl glass-pill text-slate-400 hover:text-white font-semibold text-xs"
              >
                {isAr ? "استعادة الإعدادات الافتراضية" : "Reset to Defaults"}
              </button>

              <button
                type="button"
                onClick={handleSaveCustomization}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95"
              >
                {isSavedCustomization ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    <span>{isAr ? "تم حفظ التخصيص بنجاح!" : "Customization Saved!"}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>
                      {isAr
                        ? `حفظ تخصيص واجهة (${selectedRepProfile?.full_name || "الموظف"})`
                        : "Save Rep Customization"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GENERAL SYSTEM & WHATSAPP SETTINGS                                */}
      {/* ========================================================================= */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
          {/* GENERAL SETTINGS */}
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

          {/* WHATSAPP CLICK-TO-CHAT CONFIGURATION */}
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

          {/* SCORING THRESHOLDS */}
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

          {/* DATABASE & DEMO DATA RESET */}
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
              {isSavedGeneral ? (
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
      )}

      {/* Super Admin Employee Modal */}
      <AddEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSaved={() => {
          db.getProfiles().then(setProfiles);
          if (refreshProfiles) refreshProfiles();
        }}
      />

      {/* Add / Edit Machine Modal */}
      <AddMachineModal
        isOpen={isMachineModalOpen}
        onClose={() => setIsMachineModalOpen(false)}
        onSaved={handleSaveMachine}
        initialData={editingMachine}
      />
    </div>
  );
}
