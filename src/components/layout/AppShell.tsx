"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { RolePreviewBar } from "./RolePreviewBar";
import { QuickLeadModal } from "../leads/QuickLeadModal";
import { WhatsAppQRModal } from "../whatsapp/WhatsAppQRModal";
import { FollowUpModal } from "../followups/FollowUpModal";
import { LeadProfileModal } from "../leads/LeadProfileModal";
import { db } from "@/lib/db";
import { Lead, SalesMagnet, FollowUp } from "@/types/crm";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Global Modals
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQRLead, setSelectedQRLead] = useState<Lead | null>(null);
  const [selectedQRMagnet, setSelectedQRMagnet] = useState<SalesMagnet | null>(null);

  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedFollowUpLead, setSelectedFollowUpLead] = useState<Lead | null>(null);
  const [targetFollowUp, setTargetFollowUp] = useState<FollowUp | null>(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileLeadId, setSelectedProfileLeadId] = useState<string | null>(null);

  const [overdueCount, setOverdueCount] = useState(0);

  const refreshOverdue = async () => {
    const list = await db.getFollowUps();
    const now = new Date();
    const overdue = list.filter(
      (f) => f.status === "pending" && new Date(f.scheduled_at) < now
    ).length;
    setOverdueCount(overdue);
  };

  useEffect(() => {
    refreshOverdue();
  }, []);

  const handleActionSelect = (
    action: "profile" | "followup" | "qr",
    lead: Lead
  ) => {
    if (action === "profile") {
      setSelectedProfileLeadId(lead.id);
      setProfileModalOpen(true);
    } else if (action === "followup") {
      setSelectedFollowUpLead(lead);
      setTargetFollowUp(null);
      setFollowUpModalOpen(true);
    } else if (action === "qr") {
      setSelectedQRLead(lead);
      setSelectedQRMagnet(null);
      setQrModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-falcon-500 selection:text-white relative">
      {/* AMBIENT LUXURY GLASS GLOW MESH */}
      <div className="ambient-glow-mesh" aria-hidden="true" />
      <div className="ambient-glow-bottom" aria-hidden="true" />

      {/* 1. TOP ROLE & ENVIRONMENT BAR */}
      <RolePreviewBar />

      <div className="flex flex-1 relative z-10 overflow-hidden">
        {/* 2. DESKTOP SIDEBAR */}
        <Sidebar
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          overdueCount={overdueCount}
        />

        {/* 3. MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-0">
          <Navbar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

          <main className="flex-1 p-3.5 sm:p-5 lg:p-7 overflow-y-auto max-w-7xl w-full mx-auto relative z-10">
            {children}
          </main>
        </div>
      </div>

      {/* 4. MOBILE BOTTOM NAVIGATION DOCK */}
      <BottomNav
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        overdueCount={overdueCount}
      />

      {/* 5. GLOBAL QUICK LEAD CAPTURE MODAL (<60s) */}
      <QuickLeadModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onActionSelect={handleActionSelect}
        onLeadSaved={() => {
          refreshOverdue();
        }}
      />

      {/* 6. GLOBAL WHATSAPP QR MODAL */}
      <WhatsAppQRModal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setSelectedQRLead(null);
          setSelectedQRMagnet(null);
        }}
        preselectedLead={selectedQRLead}
        preselectedMagnet={selectedQRMagnet}
      />

      {/* 7. GLOBAL FOLLOW-UP MODAL */}
      <FollowUpModal
        isOpen={followUpModalOpen}
        onClose={() => {
          setFollowUpModalOpen(false);
          setSelectedFollowUpLead(null);
          setTargetFollowUp(null);
        }}
        targetLead={selectedFollowUpLead}
        targetFollowUp={targetFollowUp}
        onSaved={() => {
          refreshOverdue();
        }}
      />

      {/* 8. GLOBAL LEAD PROFILE MODAL */}
      <LeadProfileModal
        leadId={selectedProfileLeadId}
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedProfileLeadId(null);
        }}
        onOpenFollowUp={(lead) => {
          setSelectedFollowUpLead(lead);
          setFollowUpModalOpen(true);
        }}
        onOpenQR={(lead) => {
          setSelectedQRLead(lead);
          setQrModalOpen(true);
        }}
      />
    </div>
  );
}
