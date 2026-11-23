"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import { QRCampaign } from "@/types/crm";
import { WhatsAppQRModal } from "@/components/whatsapp/WhatsAppQRModal";
import {
  QrCode,
  Plus,
  Copy,
  Check,
  Maximize2,
  ExternalLink,
  MessageCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function WhatsAppQRPage() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<QRCampaign[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    db.getQRCampaigns().then(setCampaigns);
  }, []);

  const handleCopy = (campaign: QRCampaign) => {
    if (campaign.destination_url) {
      navigator.clipboard.writeText(campaign.destination_url);
      setCopiedId(campaign.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-falcon-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t("nav_whatsapp")}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {t("qr_center_subtitle")}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-falcon-600 hover:bg-falcon-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Launch QR Generator</span>
        </button>
      </div>

      {/* 2. HOW IT WORKS NOTICE */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white">
              Official WhatsApp Click-to-Chat Format
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5 max-w-xl">
              Encodes official <code>https://wa.me/2010...</code> with automatic pre-filled text and tracking code. When visitors scan, WhatsApp opens and they tap Send.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] self-start sm:self-center"
        >
          Open Full Screen Booth Stand
        </button>
      </div>

      {/* 3. SAVED QR CAMPAIGNS GRID */}
      <div>
        <h3 className="font-bold text-sm text-white mb-3">
          {t("qr_campaign_saved")} ({campaigns.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {camp.campaign_name}
                    </h4>
                    <span className="text-[11px] font-mono text-falcon-400 mt-0.5 block">
                      [{camp.tracking_code}]
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>

                {camp.custom_message && (
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mt-2 line-clamp-2 italic font-mono text-[11px]">
                    &quot;{camp.custom_message}&quot;
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
                  <span>
                    Scans: <strong className="text-white">{camp.scan_count}</strong>
                  </span>
                  <span>
                    WhatsApp Clicks:{" "}
                    <strong className="text-emerald-400">
                      {camp.whatsapp_click_count}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={() => handleCopy(camp)}
                  className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedId === camp.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setModalOpen(true)}
                  className="py-2 px-3 rounded-xl bg-falcon-600/20 hover:bg-falcon-600/30 text-falcon-300 font-semibold border border-falcon-500/30 flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Show Full Screen</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHATSAPP QR MODAL */}
      <WhatsAppQRModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
