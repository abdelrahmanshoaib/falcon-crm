"use client";

import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/db";
import {
  Machine,
  SalesMagnet,
  WhatsAppTemplate,
  Exhibition,
  Lead,
} from "@/types/crm";
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  QrCode,
  MessageCircle,
  Cpu,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface WhatsAppQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLead?: Lead | null;
  preselectedMagnet?: SalesMagnet | null;
  preselectedMachine?: Machine | null;
}

export function WhatsAppQRModal({
  isOpen,
  onClose,
  preselectedLead,
  preselectedMagnet,
  preselectedMachine,
}: WhatsAppQRModalProps) {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [magnets, setMagnets] = useState<SalesMagnet[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);

  // Selection states
  const [selectedExhibition, setSelectedExhibition] = useState("Cairo WoodShow 2026");
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [selectedMagnet, setSelectedMagnet] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [falconPhone, setFalconPhone] = useState(
    process.env.NEXT_PUBLIC_FALCON_WHATSAPP_PHONE || "201001112233"
  );

  // Display states
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      db.getMachines().then((list) => {
        setMachines(list);
        if (!selectedMachine) {
          setSelectedMachine(
            preselectedMachine?.name ||
              preselectedLead?.interested_machine_names?.[0] ||
              list[0]?.name ||
              "Falcon Pro-Router 1325"
          );
        }
      });

      db.getSalesMagnets().then((list) => {
        setMagnets(list);
        if (preselectedMagnet) setSelectedMagnet(preselectedMagnet.title);
      });

      db.getWhatsAppTemplates().then((list) => {
        setTemplates(list);
        if (list.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(list[0].id);
        }
      });

      db.getExhibitions().then((list) => {
        setExhibitions(list);
      });

      // Generate unique tracking code
      const randTag = Math.random().toString(36).substring(2, 6).toUpperCase();
      setTrackingCode(`FALCON-CWS26-${randTag}`);
    }
  }, [isOpen, preselectedLead, preselectedMagnet, preselectedMachine]);

  // Construct final WhatsApp Message
  const getCompiledMessage = (): string => {
    const activeTemplate = templates.find((t) => t.id === selectedTemplateId);
    let body = customMessage || activeTemplate?.message_body || "";

    body = body
      .replace(/{{EXHIBITION}}/g, selectedExhibition)
      .replace(/{{MACHINE_NAME}}/g, selectedMachine || "CNC Machinery")
      .replace(/{{TRACKING_CODE}}/g, trackingCode);

    if (selectedMagnet && !body.includes(selectedMagnet)) {
      body += `\nResource requested: ${selectedMagnet}`;
    }

    return body;
  };

  const compiledMessage = getCompiledMessage();
  const whatsappUrl = `https://wa.me/${falconPhone}?text=${encodeURIComponent(
    compiledMessage
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svgElement = qrRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 500, 500);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${trackingCode || "falcon-qr"}.png`;
        downloadLink.href = pngUrl;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto ${
        isFullScreen ? "p-0" : ""
      }`}
    >
      <div
        className={`bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col ${
          isFullScreen
            ? "w-screen h-screen rounded-none max-w-none"
            : "w-full max-w-2xl rounded-2xl max-h-[92vh] overflow-hidden my-auto"
        }`}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">
                {t("qr_center_title")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t("qr_center_subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen Booth Mode"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div
          className={`flex-1 overflow-y-auto p-4 sm:p-6 ${
            isFullScreen
              ? "flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl mx-auto"
              : "grid grid-cols-1 md:grid-cols-2 gap-6"
          }`}
        >
          {/* QR DISPLAY CARD (HIGH VISIBILITY FOR EXHIBITION BOOTH) */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner text-center">
            {/* Falcon CNC Branding Badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-falcon-600 flex items-center justify-center text-white">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm tracking-wider text-slate-200">
                FALCON CNC MACHINERY
              </span>
            </div>

            <h3 className="text-sm font-semibold text-white mb-1">
              {t("qr_scan_cta")}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-4">
              {t("qr_scan_sub")}
            </p>

            {/* QR CODE CONTAINER */}
            <div
              ref={qrRef}
              className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-falcon-500/30 flex items-center justify-center transition-all"
            >
              <QRCodeSVG
                value={whatsappUrl}
                size={isFullScreen ? 280 : 190}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Campaign Tracking Code Badge */}
            <div className="mt-3 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-falcon-300">
              {trackingCode}
            </div>

            {/* Crucial WhatsApp Limitation Note */}
            <p className="text-[10px] text-slate-400 mt-3 max-w-xs leading-relaxed italic">
              {t("qr_important_note")}
            </p>
          </div>

          {/* CONFIGURATION & CUSTOMIZATION */}
          <div className="space-y-3.5 text-xs">
            {/* Template Selector */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t("qr_template_label")}
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value);
                  setCustomMessage("");
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-falcon-500"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Machine & Magnet Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Associated Machine
                </label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Attached Sales Magnet
                </label>
                <select
                  value={selectedMagnet}
                  onChange={(e) => setSelectedMagnet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs truncate"
                >
                  <option value="">None (Direct Chat)</option>
                  {magnets.map((mag) => (
                    <option key={mag.id} value={mag.title}>
                      {mag.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message Preview & Custom Edit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">
                  Pre-filled WhatsApp Message
                </label>
                <span className="text-[10px] text-falcon-400">
                  Auto-encoded to wa.me
                </span>
              </div>
              <textarea
                rows={4}
                value={customMessage || compiledMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-falcon-500 font-mono leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-white transition-all text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>{t("qr_copy_link")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-white transition-all text-xs"
              >
                <Download className="w-4 h-4 text-falcon-400" />
                <span>{t("qr_download_png")}</span>
              </button>
            </div>

            {/* Save Campaign to Database */}
            <button
              type="button"
              onClick={async () => {
                await db.saveQRCampaign({
                  campaign_name: `${selectedExhibition} - ${selectedMachine}`,
                  custom_message: compiledMessage,
                  tracking_code: trackingCode,
                  destination_url: whatsappUrl,
                });
                alert("Campaign saved to QR Library!");
              }}
              className="w-full py-2.5 rounded-xl bg-falcon-600/30 hover:bg-falcon-600/40 border border-falcon-500/50 text-falcon-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-falcon-400" />
              <span>Save as Saved QR Campaign</span>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Company WhatsApp: +{falconPhone}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
