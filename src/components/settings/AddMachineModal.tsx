"use client";

import React, { useState, useEffect } from "react";
import { Machine } from "@/types/crm";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  Cpu,
  Save,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (machine: Machine) => void;
  initialData?: Machine | null;
}

const PRESET_IMAGES = [
  {
    name: "CNC Router Pro",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500",
  },
  {
    name: "ATC High Speed",
    url: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500",
  },
  {
    name: "Fiber Laser Cutting",
    url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500",
  },
  {
    name: "Heavy CNC Plasma",
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500",
  },
];

export function AddMachineModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
}: AddMachineModalProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("CNC Router");
  const [priceRange, setPriceRange] = useState("$15,000 - $22,000");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEdit = Boolean(initialData?.id);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setModel(initialData.model || "");
      setCategory(initialData.category || "CNC Router");
      setPriceRange(initialData.price_range || "");
      setDescription(initialData.description || "");
      setImageUrl(initialData.image_url || PRESET_IMAGES[0].url);
      setIsActive(initialData.is_active ?? true);
    } else {
      setName("");
      setModel("");
      setCategory("CNC Router");
      setPriceRange("$15,000 - $25,000");
      setDescription("");
      setImageUrl(PRESET_IMAGES[0].url);
      setIsActive(true);
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(isAr ? "يرجى كتابة اسم الماكينة" : "Please provide machine name");
      return;
    }
    if (!model.trim()) {
      setErrorMsg(isAr ? "يرجى كتابة رقم الموديل الكودي" : "Please provide model code");
      return;
    }

    setIsSubmitting(true);
    try {
      const machineObj: Machine = {
        id: initialData?.id || `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        model: model.trim(),
        category,
        price_range: priceRange.trim() || undefined,
        description: description.trim() || undefined,
        image_url: imageUrl,
        is_active: isActive,
      };

      onSaved(machineObj);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save machine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-modal rounded-[28px] w-full max-w-lg text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden my-auto border border-white/20 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-md">
              <Cpu className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>{isEdit ? (isAr ? "تعديل ماكينة" : "Edit Machine") : (isAr ? "إضافة ماكينة جديدة" : "Add New Machine")}</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? "تحديد الاسم، الموديل، الفئة، ونطاق السعر لتسجيل عملاء المعرض"
                  : "Specify machine name, model code, category and price range"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white glass-pill transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Name & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {isAr ? "اسم الماكينة" : "Machine Name"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Falcon Pro-Router 1325"
                className="w-full glass-input rounded-xl p-2.5 text-white outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {isAr ? "كود الموديل" : "Model Code"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. F-1325P"
                className="w-full glass-input rounded-xl p-2.5 text-white font-mono outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
          </div>

          {/* Category & Price Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {isAr ? "الفئة / النوع" : "Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-white bg-slate-900 outline-none focus:ring-1 focus:ring-cyan-400/50"
              >
                <option value="CNC Router">CNC Router (روتر أخشاب)</option>
                <option value="CNC Router ATC">CNC Router ATC (مغير أوتوماتيك)</option>
                <option value="Fiber Laser">Fiber Laser (ليزر فايبر معادن)</option>
                <option value="CNC Plasma">CNC Plasma (بلازما ثقيل)</option>
                <option value="Edge Bander">Edge Bander (ماكينة شريط قشاط)</option>
                <option value="Panel Saw">Panel Saw (منشار صينية رأسي/أفقي)</option>
                <option value="Laser CO2">Laser CO2 (ليزر أكريليك وأخشاب)</option>
                <option value="Other">Other Category (فئة أخرى)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {isAr ? "نطاق السعر التقديري" : "Estimated Price Range"}
              </label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="e.g. $18,000 - $24,000"
                className="w-full glass-input rounded-xl p-2.5 text-white font-mono outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>
          </div>

          {/* Image Presets Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? "صورة الماكينة" : "Machine Image"}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(img.url)}
                  className={`p-1 rounded-xl border transition-all text-center group ${
                    imageUrl === img.url
                      ? "border-cyan-400 bg-cyan-500/20 shadow-md shadow-cyan-500/20"
                      : "border-white/10 hover:border-white/30 bg-black/30"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-12 rounded-lg object-cover"
                  />
                  <span className="text-[9px] text-slate-400 block truncate mt-1 group-hover:text-white">
                    {img.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {isAr ? "الوصف والمواصفات الفنية" : "Description & Specifications"}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "مواصفات الموتور والتحكم والسرعة..." : "Spindle power, control system, working area..."}
              className="w-full glass-input rounded-xl p-2.5 text-white outline-none focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <div>
              <span className="font-semibold text-white block">
                {isAr ? "تفعيل الماكينة في قوائم المعرض" : "Active in Exhibition Lists"}
              </span>
              <span className="text-[11px] text-slate-400">
                {isAr ? "الماكينات النشطة فقط تظهر لمندوبي المبيعات عند تسجيل العملاء" : "Only active machines appear in lead capture select"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                isActive ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-pill text-slate-300 hover:text-white font-semibold text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-falcon-500 hover:from-cyan-400 hover:to-falcon-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isAr ? "حفظ الماكينة" : "Save Machine"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
