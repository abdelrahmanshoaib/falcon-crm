import {
  Lead,
  FollowUp,
  Exhibition,
  Machine,
  SalesMagnet,
  WhatsAppTemplate,
  QRCampaign,
  UserProfile,
  LeadNote,
  LeadActivity,
  AppNotification,
} from "@/types/crm";
import { isSupabaseConfigured, supabase } from "./supabase";
import {
  initialProfiles,
  initialExhibitions,
  initialMachines,
  initialSalesMagnets,
  initialWhatsAppTemplates,
  initialLeads,
  initialFollowUps,
  initialNotes,
  initialActivities,
  initialQRCampaigns,
  initialNotifications,
} from "./seed-data";
import { normalizePhoneNumber } from "./utils";
import { calculateLeadScore } from "./scoring";

// Storage Keys for persistent client-side / offline mode
const STORAGE_KEYS = {
  LEADS: "falcon_leads_store",
  FOLLOW_UPS: "falcon_followups_store",
  EXHIBITIONS: "falcon_exhibitions_store",
  MACHINES: "falcon_machines_store",
  MAGNETS: "falcon_magnets_store",
  TEMPLATES: "falcon_templates_store",
  QR_CAMPAIGNS: "falcon_qr_campaigns_store",
  PROFILES: "falcon_profiles_store",
  NOTES: "falcon_notes_store",
  ACTIVITIES: "falcon_activities_store",
  NOTIFICATIONS: "falcon_notifications_store",
  OFFLINE_QUEUE: "falcon_offline_leads_queue",
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

export const db = {
  // Check backend type
  isRealSupabase(): boolean {
    return isSupabaseConfigured();
  },

  // RESET DEMO DATA
  resetDemoData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
    localStorage.removeItem(STORAGE_KEYS.EXHIBITIONS);
    localStorage.removeItem(STORAGE_KEYS.MACHINES);
    localStorage.removeItem(STORAGE_KEYS.MAGNETS);
    localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
    localStorage.removeItem(STORAGE_KEYS.QR_CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    window.location.reload();
  },

  // 1. LEADS
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Lead[];
    }
    return getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
  },

  async getLeadById(id: string): Promise<Lead | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) return data as Lead;
    }
    const leads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    return leads.find((l) => l.id === id) || null;
  },

  async checkDuplicate(phone: string, email?: string): Promise<Lead | null> {
    const normalized = normalizePhoneNumber(phone);
    if (!normalized && !email) return null;

    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from("leads").select("*");
      if (normalized && email) {
        query = query.or(`normalized_phone.eq.${normalized},email.eq.${email}`);
      } else if (normalized) {
        query = query.eq("normalized_phone", normalized);
      } else if (email) {
        query = query.eq("email", email);
      }
      const { data, error } = await query.limit(1);
      if (!error && data && data.length > 0) return data[0] as Lead;
    }

    const leads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    return (
      leads.find((l) => {
        const phoneMatch = normalized && l.normalized_phone === normalized;
        const emailMatch =
          email && l.email && l.email.toLowerCase() === email.toLowerCase();
        return phoneMatch || emailMatch;
      }) || null
    );
  },

  async createLead(newLead: Partial<Lead>, authorName = "Sales Rep"): Promise<Lead> {
    const normalizedPhone = normalizePhoneNumber(newLead.phone || "");
    const scoreResult = calculateLeadScore(newLead);

    const lead: Lead = {
      id: "l-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      full_name: newLead.full_name || "Unknown Visitor",
      phone: newLead.phone || "",
      normalized_phone: normalizedPhone,
      email: newLead.email || "",
      company_name: newLead.company_name || "",
      job_title: newLead.job_title || "",
      city: newLead.city || "Cairo",
      business_sector: newLead.business_sector || "",
      factory_status: newLead.factory_status || "yes",
      owns_cnc: newLead.owns_cnc ?? false,
      current_machines: newLead.current_machines || "",
      interested_machine_names: newLead.interested_machine_names || [],
      purchase_intent: newLead.purchase_intent || "comparing_options",
      purchase_timeline: newLead.purchase_timeline || "1_3_months",
      budget_status: newLead.budget_status || "budget_available",
      decision_role: newLead.decision_role || "owner",
      lead_score: scoreResult.score,
      temperature: scoreResult.temperature,
      scoring_breakdown: scoreResult.breakdown,
      sales_stage: "new_lead",
      estimated_deal_value: newLead.estimated_deal_value || 0,
      sales_owner_id: newLead.sales_owner_id,
      sales_owner_name: newLead.sales_owner_name || authorName,
      exhibition_id: newLead.exhibition_id,
      exhibition_name: newLead.exhibition_name || "Cairo WoodShow 2026",
      source: newLead.source || "exhibition_booth",
      notes: newLead.notes || "",
      created_at: new Date().toISOString(),
      last_contact_at: new Date().toISOString(),
      next_follow_up_at: newLead.next_follow_up_at,
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("leads").insert([lead]).select().single();
      if (!error && data) {
        return data as Lead;
      }
    }

    // Local / Offline fallback
    const leads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    const updated = [lead, ...leads];
    saveToStorage(STORAGE_KEYS.LEADS, updated);

    // Queue for offline sync
    const offlineQueue = getFromStorage<Lead[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    saveToStorage(STORAGE_KEYS.OFFLINE_QUEUE, [lead, ...offlineQueue]);

    // Record Activity
    await this.addActivity({
      lead_id: lead.id,
      activity_type: "created",
      title: "Lead Captured at Booth",
      description: `Captured by ${authorName} at ${lead.exhibition_name}.`,
    });

    if (lead.notes) {
      await this.addNote({
        lead_id: lead.id,
        author_name: authorName,
        note: lead.notes,
      });
    }

    return lead;
  },

  async updateLead(id: string, updates: Partial<Lead>, changedByName = "Sales Rep"): Promise<Lead | null> {
    const existing = await this.getLeadById(id);
    if (!existing) return null;

    // Recalculate score if qualification fields changed
    const merged = { ...existing, ...updates };
    const scoreResult = calculateLeadScore(merged);
    merged.lead_score = scoreResult.score;
    merged.temperature = scoreResult.temperature;
    merged.scoring_breakdown = scoreResult.breakdown;
    merged.updated_at = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("leads")
        .update(merged)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Lead;
    }

    const leads = getFromStorage<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    const index = leads.findIndex((l) => l.id === id);
    if (index !== -1) {
      leads[index] = merged;
      saveToStorage(STORAGE_KEYS.LEADS, leads);
    }

    // Log update activity
    await this.addActivity({
      lead_id: id,
      activity_type: "updated",
      title: "Lead Profile Updated",
      description: `Updated by ${changedByName}.`,
    });

    return merged;
  },

  async updateLeadStage(
    id: string,
    newStage: Lead["sales_stage"],
    details?: {
      deal_value?: number;
      machine_sold?: string;
      lost_reason?: string;
      lost_notes?: string;
      notes?: string;
    },
    changedByName = "Sales Rep"
  ): Promise<Lead | null> {
    const lead = await this.getLeadById(id);
    if (!lead) return null;

    const previousStage = lead.sales_stage;
    const updates: Partial<Lead> = {
      sales_stage: newStage,
      last_contact_at: new Date().toISOString(),
    };

    if (newStage === "won") {
      updates.estimated_deal_value = details?.deal_value || lead.estimated_deal_value;
      updates.machine_sold = details?.machine_sold;
      updates.closed_at = new Date().toISOString();
    } else if (newStage === "lost") {
      updates.lost_reason = details?.lost_reason;
      updates.lost_notes = details?.lost_notes;
      updates.closed_at = new Date().toISOString();
    } else if (newStage === "quotation_sent") {
      updates.quotation_date = new Date().toISOString().split("T")[0];
      if (details?.deal_value) {
        updates.estimated_deal_value = details.deal_value;
      }
    }

    const updated = await this.updateLead(id, updates, changedByName);

    // Activity log
    await this.addActivity({
      lead_id: id,
      activity_type: "stage_change",
      title: `Moved from ${previousStage} to ${newStage}`,
      description: details?.notes || details?.lost_notes || `Stage updated by ${changedByName}.`,
    });

    return updated;
  },

  // 2. FOLLOW-UPS
  async getFollowUps(): Promise<FollowUp[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .order("scheduled_at", { ascending: true });
      if (!error && data) return data as FollowUp[];
    }
    return getFromStorage<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, initialFollowUps);
  },

  async createFollowUp(followUpData: Partial<FollowUp>, authorName = "Sales Rep"): Promise<FollowUp> {
    const item: FollowUp = {
      id: "f-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      lead_id: followUpData.lead_id || "",
      lead_name: followUpData.lead_name || "Lead",
      lead_company: followUpData.lead_company,
      lead_phone: followUpData.lead_phone,
      type: followUpData.type || "phone_call",
      title: followUpData.title || "Follow-up",
      description: followUpData.description,
      scheduled_at: followUpData.scheduled_at || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      assigned_to: followUpData.assigned_to,
      assigned_to_name: followUpData.assigned_to_name || authorName,
      priority: followUpData.priority || "medium",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("follow_ups").insert([item]).select().single();
      if (!error && data) return data as FollowUp;
    }

    const items = getFromStorage<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, initialFollowUps);
    saveToStorage(STORAGE_KEYS.FOLLOW_UPS, [item, ...items]);

    // Update lead's next follow up date
    if (item.lead_id) {
      await this.updateLead(item.lead_id, { next_follow_up_at: item.scheduled_at }, authorName);
      await this.addActivity({
        lead_id: item.lead_id,
        activity_type: "followup_scheduled",
        title: `Follow-up Scheduled: ${item.title}`,
        description: `Scheduled for ${new Date(item.scheduled_at).toLocaleDateString()}`,
      });
    }

    return item;
  },

  async completeFollowUp(
    id: string,
    notes: string,
    nextFollowUpDate?: string,
    authorName = "Sales Rep"
  ): Promise<FollowUp | null> {
    const items = await this.getFollowUps();
    const target = items.find((f) => f.id === id);
    if (!target) return null;

    target.status = "completed";
    target.completed_at = new Date().toISOString();
    target.completion_notes = notes;

    if (isSupabaseConfigured() && supabase) {
      await supabase.from("follow_ups").update(target).eq("id", id);
    } else {
      const list = getFromStorage<FollowUp[]>(STORAGE_KEYS.FOLLOW_UPS, initialFollowUps);
      const idx = list.findIndex((f) => f.id === id);
      if (idx !== -1) {
        list[idx] = target;
        saveToStorage(STORAGE_KEYS.FOLLOW_UPS, list);
      }
    }

    // Log Activity & Note on Lead
    if (target.lead_id) {
      await this.addNote({
        lead_id: target.lead_id,
        author_name: authorName,
        note: `[Follow-up Completed - ${target.type}]: ${notes}`,
      });

      await this.addActivity({
        lead_id: target.lead_id,
        activity_type: "follow_up_completed",
        title: `Follow-up Completed: ${target.title}`,
        description: notes,
      });

      // Update lead next follow up
      await this.updateLead(
        target.lead_id,
        {
          last_contact_at: new Date().toISOString(),
          next_follow_up_at: nextFollowUpDate || undefined,
        },
        authorName
      );
    }

    return target;
  },

  // 3. EXHIBITIONS
  async getExhibitions(): Promise<Exhibition[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("exhibitions").select("*");
      if (!error && data) return data as Exhibition[];
    }
    return getFromStorage<Exhibition[]>(STORAGE_KEYS.EXHIBITIONS, initialExhibitions);
  },

  // 4. MACHINES
  async getMachines(): Promise<Machine[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("machines").select("*").eq("is_active", true);
      if (!error && data) return data as Machine[];
    }
    return getFromStorage<Machine[]>(STORAGE_KEYS.MACHINES, initialMachines);
  },

  // 5. SALES MAGNETS
  async getSalesMagnets(): Promise<SalesMagnet[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("sales_magnets").select("*").eq("is_active", true);
      if (!error && data) return data as SalesMagnet[];
    }
    return getFromStorage<SalesMagnet[]>(STORAGE_KEYS.MAGNETS, initialSalesMagnets);
  },

  async trackMagnetInteraction(id: string, type: "download" | "share"): Promise<void> {
    const magnets = await this.getSalesMagnets();
    const magnet = magnets.find((m) => m.id === id);
    if (magnet) {
      if (type === "download") magnet.downloads_count += 1;
      if (type === "share") magnet.shares_count += 1;

      if (isSupabaseConfigured() && supabase) {
        await supabase.from("sales_magnets").update(magnet).eq("id", id);
      } else {
        const list = getFromStorage<SalesMagnet[]>(STORAGE_KEYS.MAGNETS, initialSalesMagnets);
        const idx = list.findIndex((m) => m.id === id);
        if (idx !== -1) {
          list[idx] = magnet;
          saveToStorage(STORAGE_KEYS.MAGNETS, list);
        }
      }
    }
  },

  // 6. WHATSAPP TEMPLATES & QR CAMPAIGNS
  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("whatsapp_templates").select("*");
      if (!error && data) return data as WhatsAppTemplate[];
    }
    return getFromStorage<WhatsAppTemplate[]>(STORAGE_KEYS.TEMPLATES, initialWhatsAppTemplates);
  },

  async getQRCampaigns(): Promise<QRCampaign[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("qr_campaigns").select("*");
      if (!error && data) return data as QRCampaign[];
    }
    return getFromStorage<QRCampaign[]>(STORAGE_KEYS.QR_CAMPAIGNS, initialQRCampaigns);
  },

  async saveQRCampaign(campaign: Partial<QRCampaign>): Promise<QRCampaign> {
    const item: QRCampaign = {
      id: "qr-" + Date.now(),
      campaign_name: campaign.campaign_name || "Booth QR Campaign",
      exhibition_id: campaign.exhibition_id,
      sales_rep_id: campaign.sales_rep_id,
      machine_id: campaign.machine_id,
      sales_magnet_id: campaign.sales_magnet_id,
      template_id: campaign.template_id,
      custom_message: campaign.custom_message,
      tracking_code: campaign.tracking_code || `FALCON-${Date.now().toString().slice(-4)}`,
      redirect_slug: campaign.redirect_slug || `r-${Date.now().toString().slice(-4)}`,
      destination_url: campaign.destination_url,
      status: "active",
      scan_count: 0,
      whatsapp_click_count: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("qr_campaigns").insert([item]).select().single();
      if (!error && data) return data as QRCampaign;
    }

    const campaigns = getFromStorage<QRCampaign[]>(STORAGE_KEYS.QR_CAMPAIGNS, initialQRCampaigns);
    saveToStorage(STORAGE_KEYS.QR_CAMPAIGNS, [item, ...campaigns]);
    return item;
  },

  // 7. NOTES & ACTIVITIES
  async getLeadNotes(leadId: string): Promise<LeadNote[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("lead_notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as LeadNote[];
    }
    const notes = getFromStorage<LeadNote[]>(STORAGE_KEYS.NOTES, initialNotes);
    return notes.filter((n) => n.lead_id === leadId);
  },

  async addNote(noteData: { lead_id: string; author_name: string; note: string }): Promise<LeadNote> {
    const item: LeadNote = {
      id: "note-" + Date.now(),
      lead_id: noteData.lead_id,
      author_name: noteData.author_name,
      note: noteData.note,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("lead_notes").insert([item]).select().single();
      if (!error && data) return data as LeadNote;
    }

    const notes = getFromStorage<LeadNote[]>(STORAGE_KEYS.NOTES, initialNotes);
    saveToStorage(STORAGE_KEYS.NOTES, [item, ...notes]);
    return item;
  },

  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as LeadActivity[];
    }
    const activities = getFromStorage<LeadActivity[]>(STORAGE_KEYS.ACTIVITIES, initialActivities);
    return activities.filter((a) => a.lead_id === leadId);
  },

  async addActivity(act: {
    lead_id: string;
    activity_type: string;
    title: string;
    description?: string;
  }): Promise<LeadActivity> {
    const item: LeadActivity = {
      id: "act-" + Date.now(),
      lead_id: act.lead_id,
      activity_type: act.activity_type,
      title: act.title,
      description: act.description,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("lead_activities").insert([item]).select().single();
      if (!error && data) return data as LeadActivity;
    }

    const list = getFromStorage<LeadActivity[]>(STORAGE_KEYS.ACTIVITIES, initialActivities);
    saveToStorage(STORAGE_KEYS.ACTIVITIES, [item, ...list]);
    return item;
  },

  // 8. TEAM / PROFILES
  async getProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data) return data as UserProfile[];
    }
    return getFromStorage<UserProfile[]>(STORAGE_KEYS.PROFILES, initialProfiles);
  },

  // 9. NOTIFICATIONS
  async getNotifications(): Promise<AppNotification[]> {
    return getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  },

  async markNotificationRead(id: string): Promise<void> {
    const list = getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const item = list.find((n) => n.id === id);
    if (item) {
      item.is_read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },
};
