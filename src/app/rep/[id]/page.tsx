"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import { UserProfile } from "@/types/crm";
import { AlertCircle } from "lucide-react";

export default function DirectRepAccessPage() {
  const params = useParams();
  const router = useRouter();
  const repId = params?.id as string;

  const { loginWithProfile } = useAuth();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!repId) {
      setStatus("error");
      return;
    }

    db.getProfiles().then((list) => {
      const match = list.find(
        (p) =>
          p.id === repId ||
          p.email.toLowerCase() === repId.toLowerCase() ||
          (p.phone && p.phone.replace(/[^0-9]/g, "") === repId.replace(/[^0-9]/g, ""))
      );

      if (match) {
        setProfile(match);
        loginWithProfile(match);
        setStatus("success");
        const timer = setTimeout(() => {
          router.push("/leads?source=direct_rep");
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        setStatus("error");
      }
    });
  }, [repId, loginWithProfile, router]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="glass-modal max-w-md w-full rounded-3xl p-7 text-center space-y-5 border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-falcon-500 to-amber-400" />

        {status === "loading" && (
          <div className="space-y-4 py-8">
            <div className="w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-white">
              {isAr ? "جاري التحقق من كود دخول الموظف..." : "Verifying employee credentials..."}
            </h3>
          </div>
        )}

        {status === "success" && profile && (
          <div className="space-y-4 animate-fade-in">
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
              alt={profile.full_name}
              className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400 shadow-xl shadow-cyan-500/30 mx-auto"
            />
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block">
                {isAr ? "تم تسجيل الدخول بنجاح" : "Authenticated Successfully"}
              </span>
              <h2 className="text-xl font-black text-white mt-1">{profile.full_name}</h2>
              <span className="text-xs text-slate-300 block mt-0.5">
                {profile.role.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isAr
                ? "جاري نقلك إلى مساحة عملك بالمعرض..."
                : "Redirecting to your personalized leads dashboard..."}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? "رابط دخول غير صالح" : "Invalid Direct Access Link"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? "لم نتمكن من العثور على حساب مطابق لهذا الرابط. يرجى مراجعة إدارة النظام."
                  : "Could not find a valid employee profile matching this URL."}
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10"
            >
              {isAr ? "الذهاب إلى بوابة تسجيل الدخول" : "Go to Login Portal"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
