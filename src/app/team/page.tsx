"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import { UserProfile, Lead, FollowUp, UserRole } from "@/types/crm";
import { AddEmployeeModal } from "@/components/team/AddEmployeeModal";
import {
  ShieldCheck,
  UserPlus,
  Trophy,
  Users,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Power,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Award,
  Crown,
  Briefcase,
  UserCog,
  Copy,
  Check,
  LogIn,
  KeyRound,
  Lock,
  AtSign,
} from "lucide-react";

export default function TeamPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  const { currentUser, currentRole, can, refreshProfiles, loginWithProfile } = useAuth();
  const canManageStaff = currentRole === "admin" || currentRole === "manager" || can("manage_admins");

  useEffect(() => {
    if (currentRole === "sales_rep") {
      router.push("/leads");
    }
  }, [currentRole, router]);

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);

  const getLoginUrl = (profile: UserProfile) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falcon-crm-livid.vercel.app";
    return `${origin}/login?rep=${profile.id}`;
  };

  const handleCopyLoginLink = (profile: UserProfile) => {
    const url = getLoginUrl(profile);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(profile.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2200);
  };

  const getWhatsAppShareUrl = (profile: UserProfile) => {
    const loginLink = getLoginUrl(profile);
    const cleanPhone = (profile.phone || "").replace(/[^0-9]/g, "");
    const text = isAr
      ? `مرحباً يا ${profile.full_name} 👋\n\nإليك رابط دخولك المباشر لمنصة مبيعات ومعارض Falcon CNC:\n${loginLink}\n\nيمكنك من خلال هذا الرابط تسجيل العملاء بالمعرض ومتابعة صفقاتك بشكل منفصل.`
      : `Hello ${profile.full_name},\n\nHere is your direct access link for Falcon CNC Exhibition CRM:\n${loginLink}\n\nUse this link to capture booth leads and track your deals separately.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleLoginAs = (profile: UserProfile) => {
    if (loginWithProfile) {
      loginWithProfile(profile);
      router.push("/leads?source=switch_user");
    }
  };

  const loadData = async () => {
    try {
      const [profData, leadsData, fuData] = await Promise.all([
        db.getProfiles(),
        db.getLeads(),
        db.getFollowUps(),
      ]);
      setProfiles(profData);
      setLeads(leadsData);
      setFollowUps(fuData);
      if (refreshProfiles) {
        refreshProfiles();
      }
    } catch (e) {
      console.error("Error loading team data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (profile: UserProfile) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (profile: UserProfile) => {
    if (!canManageStaff) return;
    try {
      const updated = await db.updateProfile(profile.id, {
        is_active: !profile.is_active,
      });
      if (updated) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === profile.id ? { ...p, is_active: !p.is_active } : p))
        );
        if (refreshProfiles) refreshProfiles();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteProfile = async (profile: UserProfile) => {
    if (!canManageStaff) return;
    if (profile.id === currentUser.id) {
      alert(
        isAr
          ? "لا يمكنك حذف حسابك الشخصي النشط حالياً!"
          : "You cannot delete your own currently active account!"
      );
      return;
    }

    const confirmMsg = isAr
      ? `هل أنت متأكد من رغبتك في حذف حساب "${profile.full_name}"؟`
      : `Are you sure you want to remove "${profile.full_name}" from the system?`;

    if (!confirm(confirmMsg)) return;

    try {
      const success = await db.deleteProfile(profile.id);
      if (success) {
        setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
        if (refreshProfiles) refreshProfiles();
      }
    } catch (err) {
      console.error("Failed to delete profile:", err);
    }
  };

  const handleProfileSaved = (savedProfile: UserProfile) => {
    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === savedProfile.id);
      if (exists) {
        return prev.map((p) => (p.id === savedProfile.id ? savedProfile : p));
      }
      return [savedProfile, ...prev];
    });
    if (refreshProfiles) refreshProfiles();
  };

  // Filtered profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.full_name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      (p.phone && p.phone.toLowerCase().includes(query));
    return matchesRole && matchesSearch;
  });

  // Summary Metrics
  const totalEmployees = profiles.length;
  const activeEmployees = profiles.filter((p) => p.is_active).length;
  const totalSalesReps = profiles.filter((p) => p.role === "sales_rep").length;
  const totalManagers = profiles.filter((p) => p.role === "manager").length;
  const totalAdmins = profiles.filter((p) => p.role === "admin").length;

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* 1. HEADER WITH SUPER ADMIN CONTROL */}
      <div className="relative rounded-3xl p-5 sm:p-6 glass-panel border border-white/10 shadow-xl overflow-hidden">
        {/* Specular ambient accent */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/15">
                <ShieldCheck className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {t("team_management")}
                  </h1>
                  {canManageStaff && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                      <Crown className="w-3 h-3 text-amber-300" />
                      <span>{isAr ? "تحكم الإدارة" : "Manager/Admin Control"}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? "إدارة كوادر المبيعات بالمعارض، تعديل اليوزر والباسورد، ومتابعة الأداء لحظياً"
                    : "Exhibition staff management, credentials editing, and performance tracking."}
                </p>
              </div>
            </div>
          </div>

          {/* Action button: Add Employee */}
          {canManageStaff && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-falcon-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 group"
            >
              <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{t("add_employee")}</span>
            </button>
          )}
        </div>

        {/* 2. STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5 pt-4 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? "إجمالي الكادر" : "Total Staff"}
            </span>
            <span className="text-lg font-black text-white">{totalEmployees}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? "نشط حالياً" : "Active Now"}
            </span>
            <span className="text-lg font-black text-emerald-400">{activeEmployees}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? "مندوبو المبيعات" : "Sales Reps"}
            </span>
            <span className="text-lg font-black text-cyan-400">{totalSalesReps}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? "مدراء المبيعات" : "Sales Managers"}
            </span>
            <span className="text-lg font-black text-falcon-300">{totalManagers}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isAr ? "سوبر أدمن" : "Super Admins"}
            </span>
            <span className="text-lg font-black text-amber-400">{totalAdmins}</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & ROLE FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "البحث بالاسم، البريد أو الهاتف..." : "Search staff by name, email, or phone..."}
            className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-400/50 outline-none"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              roleFilter === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "glass-pill text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? "الكل" : "All"} ({profiles.length})
          </button>
          <button
            onClick={() => setRoleFilter("sales_rep")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              roleFilter === "sales_rep"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "glass-pill text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? "مندوب مبيعات" : "Sales Reps"} ({totalSalesReps})
          </button>
          <button
            onClick={() => setRoleFilter("manager")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              roleFilter === "manager"
                ? "bg-falcon-500/20 text-falcon-300 border border-falcon-400/40 shadow-sm"
                : "glass-pill text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? "مدراء" : "Managers"} ({totalManagers})
          </button>
          <button
            onClick={() => setRoleFilter("admin")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              roleFilter === "admin"
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm"
                : "glass-pill text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? "سوبر أدمن" : "Admins"} ({totalAdmins})
          </button>
        </div>
      </div>

      {/* 4. TEAM ROSTER CARDS */}
      {filteredProfiles.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card text-center border border-white/10 space-y-3">
          <Users className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {isAr ? "لم يتم العثور على موظفين" : "No employees found"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isAr
              ? "جرّب تغيير كلمات البحث أو الفلاتر، أو قم بإضافة موظف جديد الآن"
              : "Try adjusting search terms or add a new team member."}
          </p>
          {canManageStaff && (
            <button
              onClick={handleOpenAddModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t("add_employee")}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((profile) => {
            const repLeads = leads.filter((l) => l.sales_owner_id === profile.id);
            const repHot = repLeads.filter((l) => l.temperature === "HOT").length;
            const repQuotes = repLeads.filter((l) => l.sales_stage === "quotation_sent").length;
            const repWon = repLeads.filter((l) => l.sales_stage === "won").length;

            const isCurrentAuthUser = profile.id === currentUser.id;

            return (
              <div
                key={profile.id}
                className="glass-card glass-card-hover rounded-3xl p-5 border border-white/10 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Specular line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent group-hover:via-cyan-400/70 transition-all" />

                <div>
                  {/* Card Header: Avatar, Name, Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            profile.avatar_url ||
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
                          }
                          alt={profile.full_name}
                          className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white/15 shadow-md"
                        />
                        {/* Active Pulse Status */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#090f20] flex items-center justify-center ${
                            profile.is_active ? "bg-emerald-400" : "bg-rose-500"
                          }`}
                          title={profile.is_active ? "Active" : "Suspended"}
                        >
                          {profile.is_active && (
                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                            {profile.full_name}
                          </h3>
                          {isCurrentAuthUser && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                              {isAr ? "أنت" : "You"}
                            </span>
                          )}
                        </div>

                        {/* Role Badge */}
                        <div className="mt-1 flex items-center gap-1.5">
                          {profile.role === "admin" && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 text-amber-300" />
                              <span>{isAr ? "سوبر أدمن" : "Super Admin"}</span>
                            </span>
                          )}
                          {profile.role === "manager" && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-falcon-500/15 text-falcon-300 border border-falcon-500/30 flex items-center gap-1">
                              <Briefcase className="w-2.5 h-2.5 text-falcon-300" />
                              <span>{isAr ? "مدير مبيعات" : "Sales Manager"}</span>
                            </span>
                          )}
                          {profile.role === "sales_rep" && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                              <UserCog className="w-2.5 h-2.5 text-cyan-300" />
                              <span>{isAr ? "مندوب مبيعات" : "Sales Rep"}</span>
                            </span>
                          )}

                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                              profile.is_active
                                ? "text-emerald-400 bg-emerald-500/10"
                                : "text-rose-400 bg-rose-500/10"
                            }`}
                          >
                            {profile.is_active
                              ? isAr
                                ? "نشط"
                                : "Active"
                              : isAr
                              ? "موقوف"
                              : "Suspended"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info & Credentials */}
                  <div className="text-xs text-slate-300 space-y-2 pt-3.5 border-t border-white/10 mt-3.5">
                    {/* Username & Password */}
                    <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-cyan-300" title="Username">
                        <AtSign className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate font-bold">{profile.username || profile.email.split("@")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-300" title="Password">
                        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate font-bold">
                          {canManageStaff ? (profile.password || "123456") : "••••••"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate text-[11px] font-mono text-slate-300">
                        {profile.email}
                      </span>
                    </div>

                    {profile.phone && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="text-[11px] font-mono text-slate-300">
                            {profile.phone}
                          </span>
                        </div>

                        {/* Quick WhatsApp button */}
                        <a
                          href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics Chips */}
                  <div className="grid grid-cols-4 gap-1.5 pt-3 text-center font-mono">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[9px] text-slate-400 block font-sans">
                        {isAr ? "العملاء" : "Leads"}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {repLeads.length}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[9px] text-rose-300 block font-sans">
                        HOT
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-rose-400">
                        {repHot}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[9px] text-amber-300 block font-sans">
                        {isAr ? "عروض" : "Quotes"}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-amber-400">
                        {repQuotes}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-[9px] text-emerald-300 block font-sans">
                        {isAr ? "مغلقة" : "Won"}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-400">
                        {repWon}
                      </span>
                    </div>
                  </div>

                  {/* 4.5. DIRECT ACCESS LINK BOX FOR THIS EMPLOYEE */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isAr ? "رابط الدخول المباشر للموظف" : "Direct Staff Login Link"}</span>
                      </span>
                      <span className="text-cyan-400/80 font-mono text-[9px] truncate max-w-[120px]">
                        /login?rep={profile.id.substring(0, 8)}...
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      {/* Copy Login Link Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyLoginLink(profile)}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                          copiedId === profile.id
                            ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-sm"
                            : "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-400/30 text-cyan-300"
                        }`}
                      >
                        {copiedId === profile.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isAr ? "تم النسخ!" : "Copied!"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isAr ? "نسخ الرابط" : "Copy Link"}</span>
                          </>
                        )}
                      </button>

                      {/* WhatsApp Share Button */}
                      {profile.phone && (
                        <a
                          href={getWhatsAppShareUrl(profile)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                          title={isAr ? "إرسال الرابط عبر واتساب" : "Send link via WhatsApp"}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isAr ? "واتساب" : "WhatsApp"}</span>
                        </a>
                      )}

                      {/* Login As Button */}
                      <button
                        type="button"
                        onClick={() => handleLoginAs(profile)}
                        className="py-1.5 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                        title={isAr ? `دخول كـ ${profile.full_name}` : `Login as ${profile.full_name}`}
                      >
                        <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isAr ? "دخول" : "Login"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. SUPER ADMIN ACTION DOCK */}
                {canManageStaff && (
                  <div className="pt-3.5 border-t border-white/10 mt-4 flex items-center justify-between gap-2">
                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(profile)}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                        profile.is_active
                          ? "text-slate-400 hover:text-amber-300"
                          : "text-emerald-400 hover:text-emerald-300"
                      }`}
                      title={
                        profile.is_active
                          ? isAr
                            ? "تعطيل الحساب"
                            : "Deactivate account"
                          : isAr
                          ? "تفعيل الحساب"
                          : "Activate account"
                      }
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>
                        {profile.is_active
                          ? isAr
                            ? "إيقاف مؤقت"
                            : "Suspend"
                          : isAr
                          ? "تفعيل"
                          : "Activate"}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(profile)}
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{isAr ? "تعديل البيانات والباسورد" : "Edit & Password"}</span>
                      </button>

                      {/* Delete Button (disabled for self) */}
                      {!isCurrentAuthUser && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProfile(profile)}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all"
                          title={isAr ? "حذف الموظف" : "Delete employee"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. ADD / EDIT EMPLOYEE MODAL */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleProfileSaved}
        initialData={editingProfile}
      />
    </div>
  );
}
