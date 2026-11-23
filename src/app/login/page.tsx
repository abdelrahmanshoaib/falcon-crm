"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Cpu,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Crown,
  Briefcase,
  UserCog,
  Globe,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repParam = searchParams.get("rep") || searchParams.get("user") || searchParams.get("token");

  const { login, loginWithProfile, isAuthenticated, currentRole } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAr = language === "ar";

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // If already authenticated, redirect to proper landing
  useEffect(() => {
    if (isAuthenticated) {
      if (currentRole === "sales_rep") {
        router.push("/leads");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, currentRole, router]);

  // Handle direct rep link if provided
  useEffect(() => {
    if (repParam) {
      db.getProfiles().then((list) => {
        const found = list.find(
          (p) =>
            p.id === repParam ||
            p.email.toLowerCase() === repParam.toLowerCase() ||
            (p.username && p.username.toLowerCase() === repParam.toLowerCase())
        );

        if (found) {
          if (found.is_active) {
            loginWithProfile(found);
            if (found.role === "sales_rep") {
              router.push("/leads?login=success");
            } else {
              router.push("/");
            }
          } else {
            setErrorMsg(
              isAr
                ? "هذا الحساب موقوف حالياً، يرجى مراجعة إدارة النظام."
                : "This account is suspended. Contact admin."
            );
          }
        }
      });
    }
  }, [repParam, isAr, loginWithProfile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!usernameOrEmail.trim()) {
      setErrorMsg(isAr ? "يرجى إدخال اسم المستخدم أو البريد الإلكتروني" : "Please enter your username or email.");
      return;
    }
    if (!password) {
      setErrorMsg(isAr ? "يرجى إدخال كلمة المرور" : "Please enter your password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(usernameOrEmail, password);
      if (res.success) {
        // Redirect handled by useEffect or push directly
        const list = await db.getProfiles();
        const loggedUser = list.find(
          (p) =>
            (p.username && p.username.toLowerCase() === usernameOrEmail.trim().toLowerCase()) ||
            p.email.toLowerCase() === usernameOrEmail.trim().toLowerCase()
        );
        if (loggedUser?.role === "sales_rep") {
          router.push("/leads");
        } else {
          router.push("/");
        }
      } else {
        setErrorMsg(res.message || (isAr ? "فشل تسجيل الدخول." : "Login failed."));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? "حدث خطأ غير متوقع" : "Unexpected error."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsernameOrEmail(u);
    setPassword(p);
    setErrorMsg("");
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto animate-fade-in relative z-20">
      {/* Language Switcher Pill */}
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-pill text-slate-300 hover:text-white text-xs font-semibold border border-white/10"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === "en" ? "العربية (RTL)" : "English (LTR)"}</span>
        </button>
      </div>

      <div className="glass-modal rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden">
        {/* Specular top glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-falcon-500 to-amber-400" />

        {/* Brand Header */}
        <div className="text-center space-y-3 pb-6 border-b border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-falcon-600 via-cyan-500 to-amber-400 p-[1.5px] mx-auto shadow-xl shadow-falcon-500/25">
            <div className="w-full h-full rounded-2xl bg-[#070d1e] flex items-center justify-center text-white">
              <Cpu className="w-7 h-7 text-cyan-300" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">
              FALCON CNC MACHINERY
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {isAr ? "تسجيل دخول كادر المبيعات" : "Falcon Staff Portal Login"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? "منظومة معارض المبيعات وإدارة العملاء وحسابات الكادر"
                : "Exhibition Lead Capture & Multi-Tier Sales Management"}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Username or Email */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? "اسم المستخدم أو البريد الإلكتروني" : "Username or Email"}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder={isAr ? "اسم المستخدم (مثل: admin أو mohamed)" : "Username or work email"}
                className="w-full glass-input rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? "كلمة المرور" : "Password"}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-2xl px-4 py-3 pr-10 rtl:pr-4 rtl:pl-10 text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-cyan-400/50 outline-none font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span>{isAr ? "تذكر تسجيل الدخول" : "Keep me signed in"}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-falcon-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isAr ? "تسجيل الدخول للنظام" : "Sign In to Platform"}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick Tester */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
          >
            {showDemoAccounts
              ? isAr
                ? "إخفاء الحسابات التجريبية"
                : "Hide Demo Accounts"
              : isAr
              ? "عرض حسابات الدخول التجريبية الجاهزة"
              : "Show Ready Demo Accounts"}
          </button>

          {showDemoAccounts && (
            <div className="mt-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-start space-y-2 text-[11px] animate-fade-in font-mono">
              <div
                onClick={() => handleQuickFill("admin", "admin123")}
                className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-bold text-amber-300 flex items-center gap-1 font-sans">
                    <Crown className="w-3 h-3" />
                    <span>سوبر أدمن (Admin):</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">User: admin | Pass: admin123</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-sans font-bold">ملء تلقائي</span>
              </div>

              <div
                onClick={() => handleQuickFill("ahmed", "123456")}
                className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-bold text-falcon-300 flex items-center gap-1 font-sans">
                    <Briefcase className="w-3 h-3" />
                    <span>مدير مبيعات (Sales Manager):</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">User: ahmed | Pass: 123456</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-sans font-bold">ملء تلقائي</span>
              </div>

              <div
                onClick={() => handleQuickFill("mohamed", "123456")}
                className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="font-bold text-cyan-300 flex items-center gap-1 font-sans">
                    <UserCog className="w-3 h-3" />
                    <span>مندوب مبيعات (Sales Rep):</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">User: mohamed | Pass: 123456</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-sans font-bold">ملء تلقائي</span>
              </div>
            </div>
          )}
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
