"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import { UserProfile, UserRole } from "@/types/crm";
import {
  UserCheck,
  Crown,
  Briefcase,
  UserCog,
  LogIn,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repParam = searchParams.get("rep") || searchParams.get("user") || searchParams.get("token");

  const { currentUser, loginWithProfile } = useAuth();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [autoLoggingIn, setAutoLoggingIn] = useState(Boolean(repParam));
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    db.getProfiles().then((list) => {
      setProfiles(list);

      // Check auto-login param
      if (repParam) {
        const found = list.find(
          (p) =>
            p.id === repParam ||
            p.email.toLowerCase() === repParam.toLowerCase() ||
            (p.phone && p.phone.replace(/[^0-9]/g, "") === repParam.replace(/[^0-9]/g, ""))
        );

        if (found) {
          setMatchedProfile(found);
          loginWithProfile(found);
          // Redirect after 1.4s
          const timer = setTimeout(() => {
            router.push("/leads?login=success");
          }, 1400);
          return () => clearTimeout(timer);
        } else {
          setAutoLoggingIn(false);
          setErrorMsg(
            isAr
              ? "رابط الدخول غير صالح أو لم يتم العثور على الموظف."
              : "Invalid direct login link or employee not found."
          );
        }
      }
    });
  }, [repParam, isAr, loginWithProfile, router]);

  const handleSelectEmployee = (profile: UserProfile) => {
    loginWithProfile(profile);
    setMatchedProfile(profile);
    setAutoLoggingIn(true);
    setTimeout(() => {
      router.push("/leads?login=success");
    }, 1000);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const query = customInput.trim().toLowerCase();
    if (!query) return;

    const found = profiles.find(
      (p) =>
        p.id.toLowerCase() === query ||
        p.email.toLowerCase() === query ||
        (p.phone && p.phone.replace(/[^0-9]/g, "").includes(query.replace(/[^0-9]/g, "")))
    );

    if (found) {
      handleSelectEmployee(found);
    } else {
      setErrorMsg(
        isAr
          ? "لم يتم العثور على موظف بهذا البريد أو الهاتف أو المعرف."
          : "No employee found matching this email, phone, or ID."
      );
    }
  };

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    const q = customInput.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.phone && p.phone.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  // AUTO-LOGIN SUCCESS SCREEN
  if (autoLoggingIn && matchedProfile) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="glass-modal max-w-md w-full rounded-3xl p-7 text-center space-y-5 border border-cyan-400/40 shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Specular top glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-falcon-400 to-amber-400 animate-pulse" />

          <div className="relative mx-auto w-20 h-20">
            <img
              src={
                matchedProfile.avatar_url ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
              }
              alt={matchedProfile.full_name}
              className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400 shadow-xl shadow-cyan-500/30"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest block">
              {isAr ? "مرحباً بك مجدداً" : "Welcome Back"}
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              {matchedProfile.full_name}
            </h2>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/[0.05] border border-white/10 text-slate-300">
              {matchedProfile.role === "admin" && (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-amber-300">{isAr ? "سوبر أدمن" : "Super Admin"}</span>
                </>
              )}
              {matchedProfile.role === "manager" && (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-falcon-300" />
                  <span className="text-falcon-300">{isAr ? "مدير مبيعات" : "Sales Manager"}</span>
                </>
              )}
              {matchedProfile.role === "sales_rep" && (
                <>
                  <UserCog className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="text-cyan-300">{isAr ? "مندوب مبيعات" : "Sales Representative"}</span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isAr
              ? "تم التحقق من هويتك بنجاح. سيتم الآن ربط أي عملاء تسجلهم بحسابك مباشرة وبشكل منفصل."
              : "Access verified. Any exhibition leads you capture will be credited directly to your profile."}
          </p>

          <div className="pt-2">
            <button
              onClick={() => router.push("/leads")}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-falcon-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isAr ? "الدخول لصفحة العملاء الآن" : "Go to Leads Cockpit"}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8 pt-2">
      {/* 1. PORTAL HEADER */}
      <div className="relative rounded-3xl p-6 sm:p-8 glass-panel border border-white/10 shadow-2xl text-center overflow-hidden">
        {/* Specular ambient accents */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-r from-cyan-500/20 via-falcon-500/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-falcon-600 to-cyan-400 border border-white/20 flex items-center justify-center mx-auto text-white shadow-xl shadow-falcon-500/30">
            <Cpu className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              Falcon CNC Machinery CRM
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {isAr ? "بوابة دخول كادر المبيعات والمعارض" : "Falcon Sales Staff Access Portal"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              {isAr
                ? "اختر حسابك الشخصي للدخول المباشر وتسجيل ومتابعة عملائك بالمعرض بشكل مستقل"
                : "Select your profile to access your independent lead list, register exhibition prospects, and track deals."}
            </p>
          </div>

          {/* Current Logged In Banner if active */}
          {currentUser && (
            <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3 text-start">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    currentUser.avatar_url ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
                  }
                  alt={currentUser.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-cyan-400/50"
                />
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {isAr ? "مسجل دخول حالياً باسم:" : "Currently signed in as:"}
                  </span>
                  <span className="font-bold text-xs text-white">
                    {currentUser.full_name} ({currentUser.role.replace("_", " ")})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/leads")}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow-sm transition-all"
                >
                  {isAr ? "متابعة" : "Continue"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. DIRECT ACCESS INPUT */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-white/10">
        <form onSubmit={handleCustomLogin} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={
                isAr
                  ? "أدخل بريدك الإلكتروني، رقم هاتفك أو كود الموظف..."
                  : "Enter your work email, phone, or staff ID..."
              }
              className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-cyan-400/50 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-falcon-500 hover:from-cyan-400 hover:to-falcon-400 text-white font-bold text-xs shadow-md shadow-cyan-500/20 whitespace-nowrap transition-all"
          >
            {isAr ? "دخول مباشر" : "Direct Access"}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 3. EMPLOYEE DIRECTORY */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              {isAr ? "اختر موظفاً لتسجيل الدخول الفوري" : "Choose Employee for Instant Access"}
            </h2>
            <span className="text-xs text-slate-400">({filteredProfiles.length})</span>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                  : "glass-pill text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setRoleFilter("sales_rep")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === "sales_rep"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                  : "glass-pill text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "مندوبو المبيعات" : "Sales Reps"}
            </button>
            <button
              onClick={() => setRoleFilter("manager")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === "manager"
                  ? "bg-falcon-500/20 text-falcon-300 border border-falcon-400/40"
                  : "glass-pill text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "مدراء المبيعات" : "Managers"}
            </button>
            <button
              onClick={() => setRoleFilter("admin")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === "admin"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                  : "glass-pill text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "سوبر أدمن" : "Admins"}
            </button>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProfiles.map((p) => {
            const isCurrent = currentUser?.id === p.id;

            return (
              <div
                key={p.id}
                onClick={() => handleSelectEmployee(p)}
                className={`glass-card glass-card-hover rounded-3xl p-4 border cursor-pointer transition-all flex items-center justify-between gap-3 group relative overflow-hidden ${
                  isCurrent
                    ? "border-cyan-400/60 bg-cyan-950/20 shadow-lg shadow-cyan-500/15"
                    : "border-white/10 hover:border-cyan-400/40"
                }`}
              >
                {/* Specular highlight */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent group-hover:via-cyan-400/70 transition-all" />

                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={
                        p.avatar_url ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
                      }
                      alt={p.full_name}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-md"
                    />
                    <span
                      className={`w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-[#070d1d] ${
                        p.is_active ? "bg-emerald-400" : "bg-rose-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                      {p.full_name}
                    </h3>

                    {/* Role Badge */}
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {p.role === "admin" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          <span>{isAr ? "سوبر أدمن" : "Admin"}</span>
                        </span>
                      )}
                      {p.role === "manager" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-falcon-500/15 text-falcon-300 border border-falcon-500/30 flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5" />
                          <span>{isAr ? "مدير مبيعات" : "Manager"}</span>
                        </span>
                      )}
                      {p.role === "sales_rep" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <UserCog className="w-2.5 h-2.5" />
                          <span>{isAr ? "مندوب مبيعات" : "Sales Rep"}</span>
                        </span>
                      )}

                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                          {isAr ? "نشط حالياً" : "Current"}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 truncate block mt-1 font-mono">
                      {p.email}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400 flex items-center justify-center text-slate-400 transition-all">
                    <LogIn className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-cyan-400">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
