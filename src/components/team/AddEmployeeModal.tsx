"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { UserProfile, UserRole } from "@/types/crm";
import { db } from "@/lib/db";
import {
  X,
  UserPlus,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  User,
  Check,
  Globe,
  Camera,
  Copy,
  MessageCircle,
  KeyRound,
  Sparkles,
} from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (profile: UserProfile) => void;
  initialData?: UserProfile | null;
}

const AVATAR_PRESETS = [
  {
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    label: "Professional 1",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    label: "Professional 2",
  },
  {
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
    label: "Professional 3",
  },
  {
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    label: "Professional 4",
  },
  {
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
    label: "Professional 5",
  },
  {
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    label: "Professional 6",
  },
];

export function AddEmployeeModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
}: AddEmployeeModalProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("sales_rep");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "ar">("ar");
  const [isActive, setIsActive] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0].url);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdProfile, setCreatedProfile] = useState<UserProfile | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isEditMode = Boolean(initialData?.id);

  useEffect(() => {
    setCreatedProfile(null);
    setCopiedLink(false);
    if (initialData) {
      setFullName(initialData.full_name || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setRole(initialData.role || "sales_rep");
      setPreferredLanguage(initialData.preferred_language || "ar");
      setIsActive(initialData.is_active ?? true);
      const url = initialData.avatar_url || AVATAR_PRESETS[0].url;
      setAvatarUrl(url);
      const isPreset = AVATAR_PRESETS.some((p) => p.url === url);
      setIsCustomAvatar(!isPreset);
      setCustomAvatarInput(!isPreset ? url : "");
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("sales_rep");
      setPreferredLanguage(isAr ? "ar" : "en");
      setIsActive(true);
      setAvatarUrl(AVATAR_PRESETS[0].url);
      setIsCustomAvatar(false);
      setCustomAvatarInput("");
    }
    setErrorMsg("");
  }, [initialData, isOpen, isAr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg(isAr ? "يرجى كتابة الاسم الكامل للموظف" : "Please provide the full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg(isAr ? "يرجى كتابة بريد إلكتروني صالح" : "Please provide a valid email address.");
      return;
    }

    const finalAvatar = isCustomAvatar && customAvatarInput.trim()
      ? customAvatarInput.trim()
      : avatarUrl;

    try {
      setIsSubmitting(true);
      let saved: UserProfile | null = null;

      if (isEditMode && initialData) {
        saved = await db.updateProfile(initialData.id, {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          role,
          avatar_url: finalAvatar,
          is_active: isActive,
          preferred_language: preferredLanguage,
        });
      } else {
        saved = await db.createProfile({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          role,
          avatar_url: finalAvatar,
          is_active: isActive,
          preferred_language: preferredLanguage,
        });
      }

      if (saved) {
        onSaved(saved);
        if (!isEditMode) {
          setCreatedProfile(saved);
        } else {
          onClose();
        }
      } else {
        setErrorMsg(isAr ? "حدث خطأ أثناء حفظ بيانات الموظف" : "Failed to save employee profile.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? "حدث خطأ غير متوقع" : "Unexpected error."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Background ambient luxury glow */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600/15 via-falcon-500/20 to-amber-500/15 rounded-full blur-[120px]" />
      </div>

      <div
        className="glass-modal max-w-xl w-full rounded-3xl p-5 sm:p-7 relative border border-white/15 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular top highlight line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-falcon-500/30 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              {isEditMode ? (
                <UserCheck className="w-5 h-5 text-cyan-300" />
              ) : (
                <UserPlus className="w-5 h-5 text-cyan-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {isEditMode ? t("edit_employee") : t("add_employee")}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-300" />
                  <span>{isAr ? "سوبر أدمن" : "Super Admin"}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr
                  ? "تسجيل بيانات الموظف وتحديد الصلاحيات ونطاق الوصول"
                  : "Provision employee credentials, roles, and platform permissions"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Success Link Screen OR Form */}
        {createdProfile ? (
          <div className="mt-5 text-center space-y-4 animate-fade-in">
            <div className="relative mx-auto w-16 h-16">
              <img
                src={createdProfile.avatar_url || AVATAR_PRESETS[0].url}
                alt={createdProfile.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-xl shadow-emerald-500/20"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-md">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center justify-center gap-1.5">
                <span>{isAr ? "تم إنشاء حساب الموظف بنجاح!" : "Employee Added Successfully!"}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isAr
                  ? `أصبح حساب "${createdProfile.full_name}" جاهزاً. يمكنك الآن مشاركة رابط الدخول المباشر معه.`
                  : `Profile for "${createdProfile.full_name}" is active. Share the direct access link below.`}
              </p>
            </div>

            {/* Direct Login Link Box */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-start space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? "رابط الدخول المباشر للموظف:" : "Direct Staff Login Link:"}</span>
              </label>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-cyan-300 break-all select-all">
                {`${typeof window !== "undefined" ? window.location.origin : "https://falcon-crm-livid.vercel.app"}/login?rep=${createdProfile.id}`}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const link = `${typeof window !== "undefined" ? window.location.origin : "https://falcon-crm-livid.vercel.app"}/login?rep=${createdProfile.id}`;
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(link);
                  }
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">{isAr ? "تم نسخ الرابط!" : "Copied Link!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{isAr ? "نسخ الرابط" : "Copy Link"}</span>
                  </>
                )}
              </button>

              {createdProfile.phone && (
                <a
                  href={`https://wa.me/${createdProfile.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    isAr
                      ? `مرحباً يا ${createdProfile.full_name} 👋\n\nإليك رابط دخولك المباشر لمنصة مبيعات ومعارض Falcon CNC:\n${
                          typeof window !== "undefined" ? window.location.origin : "https://falcon-crm-livid.vercel.app"
                        }/login?rep=${createdProfile.id}\n\nيمكنك من خلال هذا الرابط تسجيل العملاء بالمعرض ومتابعة صفقاتك بشكل منفصل.`
                      : `Hello ${createdProfile.full_name},\n\nHere is your direct access link for Falcon CNC Exhibition CRM:\n${
                          typeof window !== "undefined" ? window.location.origin : "https://falcon-crm-livid.vercel.app"
                        }/login?rep=${createdProfile.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? "إرسال عبر واتساب" : "Send WhatsApp"}</span>
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all whitespace-nowrap"
              >
                {isAr ? "إتمام" : "Done"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Error message */}
            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* 1. Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t("employee_name")}</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isAr ? "مثال: م. كريم الشناوي" : "e.g. Karim El-Shinawy"}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-cyan-400/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t("employee_email")}</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@falconcnc.com"
                className="w-full glass-input rounded-xl px-3 py-2.5 text-white placeholder-slate-500 text-xs font-mono focus:ring-1 focus:ring-cyan-400/50 outline-none"
              />
            </div>
          </div>

          {/* 2. Phone & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t("employee_phone")}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 123 4567"
                className="w-full glass-input rounded-xl px-3 py-2.5 text-white placeholder-slate-500 text-xs font-mono focus:ring-1 focus:ring-cyan-400/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t("employee_language")}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreferredLanguage("ar")}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    preferredLanguage === "ar"
                      ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 font-bold shadow-sm"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  العربية (RTL)
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredLanguage("en")}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    preferredLanguage === "en"
                      ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 font-bold shadow-sm"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  English (LTR)
                </button>
              </div>
            </div>
          </div>

          {/* 3. Role Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("employee_role")}</span>
              <span className="text-rose-400">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Sales Rep */}
              <div
                onClick={() => setRole("sales_rep")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  role === "sales_rep"
                    ? "bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 border-cyan-400/60 shadow-lg shadow-cyan-500/15"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-xs ${role === "sales_rep" ? "text-cyan-300" : "text-white"}`}>
                    {isAr ? "مندوب مبيعات" : "Sales Rep"}
                  </span>
                  {role === "sales_rep" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {t("employee_sales_rep_desc")}
                </p>
              </div>

              {/* Sales Manager */}
              <div
                onClick={() => setRole("manager")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  role === "manager"
                    ? "bg-gradient-to-b from-falcon-500/20 to-falcon-500/5 border-falcon-400/60 shadow-lg shadow-falcon-500/15"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-xs ${role === "manager" ? "text-falcon-300" : "text-white"}`}>
                    {isAr ? "مدير مبيعات" : "Sales Manager"}
                  </span>
                  {role === "manager" && <Check className="w-3.5 h-3.5 text-falcon-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {t("employee_manager_desc")}
                </p>
              </div>

              {/* Super Admin */}
              <div
                onClick={() => setRole("admin")}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  role === "admin"
                    ? "bg-gradient-to-b from-amber-500/25 to-amber-500/5 border-amber-400/60 shadow-lg shadow-amber-500/15"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-xs ${role === "admin" ? "text-amber-300" : "text-white"}`}>
                    {isAr ? "سوبر أدمن" : "Super Admin"}
                  </span>
                  {role === "admin" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {t("employee_admin_desc")}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Avatar Selection */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t("employee_avatar")}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomAvatar(!isCustomAvatar)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
              >
                {isCustomAvatar ? t("employee_avatar_preset") : t("employee_avatar_url")}
              </button>
            </div>

            {isCustomAvatar ? (
              <input
                type="url"
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full glass-input rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs font-mono focus:ring-1 focus:ring-cyan-400/50 outline-none"
              />
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                {AVATAR_PRESETS.map((preset, idx) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`relative flex-shrink-0 w-11 h-11 rounded-full p-0.5 border-2 transition-all ${
                        isSelected
                          ? "border-cyan-400 scale-110 shadow-lg shadow-cyan-500/30"
                          : "border-white/15 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover rounded-full"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Account Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
            <div>
              <span className="font-semibold text-white block">
                {t("employee_status")}
              </span>
              <span className="text-[10px] text-slate-400">
                {isActive ? t("employee_active") : t("employee_inactive")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isActive ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isActive ? (isAr ? "-translate-x-6" : "translate-x-6") : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-falcon-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditMode ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>{t("update_employee")}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{t("save_employee")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </>
    )}
      </div>
    </div>
  );
}
