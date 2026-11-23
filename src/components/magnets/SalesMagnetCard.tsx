"use client";

import React, { useState } from "react";
import { SalesMagnet } from "@/types/crm";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import {
  FileText,
  Video,
  Calculator,
  CheckSquare,
  Share2,
  MessageCircle,
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

interface SalesMagnetCardProps {
  magnet: SalesMagnet;
  onGenerateQR: (magnet: SalesMagnet) => void;
}

export function SalesMagnetCard({
  magnet,
  onGenerateQR,
}: SalesMagnetCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const getIcon = () => {
    switch (magnet.content_type) {
      case "video":
        return Video;
      case "calculator":
        return Calculator;
      case "pdf":
        return FileText;
      default:
        return CheckSquare;
    }
  };

  const Icon = getIcon();
  const shareUrl = magnet.file_url || magnet.external_url || "https://falconcnc.com";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    db.trackMagnetInteraction(magnet.id, "share");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    db.trackMagnetInteraction(magnet.id, "download");
    window.open(shareUrl, "_blank");
  };

  const handleWhatsAppShare = () => {
    db.trackMagnetInteraction(magnet.id, "share");
    const msg = encodeURIComponent(
      `Hello! Here is the Falcon CNC ${magnet.title}:\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-white/10 shadow-lg group relative">
      <div>
        {/* Magnet Cover Image & Category Badge */}
        <div className="relative h-40 bg-slate-950 overflow-hidden">
          <img
            src={
              magnet.cover_image_url ||
              "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500"
            }
            alt={magnet.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
            <Icon className="w-3.5 h-3.5 text-falcon-400" />
            <span>{magnet.category}</span>
          </div>

          {magnet.machine_category && (
            <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2 py-0.5 rounded text-[10px] font-mono bg-falcon-950/80 text-falcon-300 border border-falcon-700/50">
              {magnet.machine_category}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-sm text-white group-hover:text-falcon-400 transition-colors line-clamp-1">
            {magnet.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {magnet.description}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span>
              {t("magnet_downloads")}:{" "}
              <strong className="text-slate-200">{magnet.downloads_count}</strong>
            </span>
            <span>
              Shares:{" "}
              <strong className="text-slate-200">{magnet.shares_count}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 grid grid-cols-4 gap-1.5">
        <button
          onClick={handleWhatsAppShare}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 text-emerald-400 border border-slate-800 transition-colors text-[10px] font-medium"
          title="Share via WhatsApp"
        >
          <MessageCircle className="w-4 h-4 mb-0.5" />
          <span>WA</span>
        </button>

        <button
          onClick={() => onGenerateQR(magnet)}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-falcon-950/60 text-falcon-400 border border-slate-800 transition-colors text-[10px] font-medium"
          title="Generate QR for Magnet"
        >
          <QrCode className="w-4 h-4 mb-0.5" />
          <span>QR</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-[10px] font-medium"
          title="Copy Link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 mb-0.5" />
          ) : (
            <Copy className="w-4 h-4 mb-0.5" />
          )}
          <span>{copied ? "Copied" : "Link"}</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-[10px] font-medium"
          title="Download or Open"
        >
          <Download className="w-4 h-4 mb-0.5" />
          <span>Open</span>
        </button>
      </div>
    </div>
  );
}
