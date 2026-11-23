export type UserRole = "admin" | "manager" | "sales_rep";

export type LeadTemperature = "HOT" | "WARM" | "COLD";

export type SalesStage =
  | "new_lead"
  | "contacted"
  | "qualified"
  | "consultation"
  | "quotation_sent"
  | "negotiation"
  | "won"
  | "lost"
  | "on_hold";

export type FactoryStatus = "yes" | "under_construction" | "planning" | "no";

export type PurchaseIntent =
  | "ready_to_buy"
  | "comparing_options"
  | "planning_future"
  | "general_interest";

export type PurchaseTimeline =
  | "within_30_days"
  | "1_3_months"
  | "3_6_months"
  | "6_12_months"
  | "unknown";

export type BudgetStatus =
  | "budget_available"
  | "financing_needed"
  | "budget_not_defined"
  | "not_discussed";

export type DecisionRole =
  | "decision_maker"
  | "influencer"
  | "technical_evaluator"
  | "purchasing_manager"
  | "owner"
  | "unknown";

export type FollowUpType =
  | "phone_call"
  | "whatsapp"
  | "email"
  | "meeting"
  | "send_catalog"
  | "send_quotation"
  | "demo"
  | "factory_visit"
  | "financing"
  | "other";

export type FollowUpStatus = "pending" | "completed" | "cancelled";

export type FollowUpPriority = "high" | "medium" | "low";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  preferred_language: "en" | "ar";
  username?: string;
  password?: string;
}

export interface Exhibition {
  id: string;
  name: string;
  event_type?: string;
  location: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "completed" | "archived";
  target_leads: number;
  description?: string;
}

export interface Machine {
  id: string;
  name: string;
  model: string;
  category: string;
  description?: string;
  image_url?: string;
  specifications?: Record<string, string>;
  applications?: string[];
  price_range?: string;
  is_active: boolean;
}

export interface SalesMagnet {
  id: string;
  title: string;
  description?: string;
  category: string;
  content_type: "pdf" | "image" | "video" | "link" | "calculator";
  file_url?: string;
  external_url?: string;
  cover_image_url?: string;
  machine_category?: string;
  downloads_count: number;
  shares_count: number;
  is_active: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  template_type: string;
  message_body: string;
  is_active: boolean;
}

export interface QRCampaign {
  id: string;
  campaign_name: string;
  exhibition_id?: string;
  sales_rep_id?: string;
  machine_id?: string;
  sales_magnet_id?: string;
  template_id?: string;
  custom_message?: string;
  tracking_code: string;
  redirect_slug: string;
  destination_url?: string;
  qr_image_url?: string;
  status: "active" | "inactive" | "archived";
  scan_count: number;
  whatsapp_click_count: number;
  created_at: string;
}

export interface ScoreItem {
  criterion: string;
  points: number;
  reason: string;
}

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  normalized_phone: string;
  email?: string;
  company_name?: string;
  job_title?: string;
  city?: string;
  business_sector?: string;
  website?: string;
  social_links?: Record<string, string>;

  // Qualification
  factory_status?: FactoryStatus;
  owns_cnc?: boolean;
  current_machines?: string;
  interested_machine_ids?: string[];
  interested_machine_names?: string[];
  production_requirements?: string;
  purchase_intent?: PurchaseIntent;
  purchase_timeline?: PurchaseTimeline;
  budget_status?: BudgetStatus;
  decision_role?: DecisionRole;

  // Scoring & Stage
  lead_score: number;
  temperature: LeadTemperature;
  scoring_breakdown?: ScoreItem[];
  sales_stage: SalesStage;
  estimated_deal_value?: number;
  quotation_date?: string;
  quotation_file_url?: string;
  machine_sold?: string;
  closed_at?: string;
  lost_reason?: string;
  lost_notes?: string;

  // Ownership
  sales_owner_id?: string;
  sales_owner_name?: string;
  exhibition_id?: string;
  exhibition_name?: string;
  source: string;
  tracking_code?: string;
  notes?: string;

  // Timestamps
  created_at: string;
  updated_at?: string;
  last_contact_at?: string;
  next_follow_up_at?: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id?: string;
  author_name: string;
  note: string;
  created_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  lead_name?: string;
  lead_company?: string;
  lead_phone?: string;
  type: FollowUpType;
  title: string;
  description?: string;
  scheduled_at: string;
  assigned_to?: string;
  assigned_to_name?: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  completed_at?: string;
  completion_notes?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: "follow_up_due" | "follow_up_overdue" | "lead_assigned" | "lead_hot" | "status_change";
  related_lead_id?: string;
  is_read: boolean;
  created_at: string;
}
