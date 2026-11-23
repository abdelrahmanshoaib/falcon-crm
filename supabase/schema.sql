-- ==============================================================================
-- FALCON EXHIBITION CRM & SALES MAGNET SYSTEM
-- PRODUCTION DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop if refreshing (optional for fresh setups)
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- ==============================================================================
-- 1. USER PROFILES & ROLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'sales_rep')),
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. EXHIBITIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_type TEXT DEFAULT 'Machinery Exhibition',
    location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'archived')),
    target_leads INTEGER DEFAULT 100,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. MACHINERY & PRODUCT CATALOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. CNC Router, Fiber Laser, CNC Plasma, CO2 Laser, Woodworking
    description TEXT,
    image_url TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    applications TEXT[] DEFAULT ARRAY[]::TEXT[],
    price_range TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. SALES MAGNET CENTER
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sales_magnets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- Guide, Catalog, Calculator, Checklist, Demo Video
    content_type TEXT NOT NULL CHECK (content_type IN ('pdf', 'image', 'video', 'link', 'calculator')),
    file_url TEXT,
    external_url TEXT,
    cover_image_url TEXT,
    machine_category TEXT,
    downloads_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. WHATSAPP TEMPLATES & QR CAMPAIGNS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- general, catalog, pricing, consultation, demo, financing, custom
    message_body TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qr_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name TEXT NOT NULL,
    exhibition_id UUID REFERENCES public.exhibitions(id) ON DELETE SET NULL,
    sales_rep_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,
    sales_magnet_id UUID REFERENCES public.sales_magnets(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
    custom_message TEXT,
    tracking_code TEXT NOT NULL UNIQUE,
    redirect_slug TEXT NOT NULL UNIQUE,
    destination_url TEXT,
    qr_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    scan_count INTEGER DEFAULT 0,
    whatsapp_click_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. LEADS (CENTRAL CRM REPOSITORY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    normalized_phone TEXT NOT NULL,
    email TEXT,
    company_name TEXT,
    job_title TEXT,
    city TEXT,
    business_sector TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    
    -- Qualification criteria
    factory_status TEXT CHECK (factory_status IN ('yes', 'under_construction', 'planning', 'no')),
    owns_cnc BOOLEAN DEFAULT FALSE,
    current_machines TEXT,
    interested_machine_ids UUID[] DEFAULT ARRAY[]::UUID[],
    interested_machine_names TEXT[] DEFAULT ARRAY[]::TEXT[],
    production_requirements TEXT,
    purchase_intent TEXT CHECK (purchase_intent IN ('ready_to_buy', 'comparing_options', 'planning_future', 'general_interest')),
    purchase_timeline TEXT CHECK (purchase_timeline IN ('within_30_days', '1_3_months', '3_6_months', '6_12_months', 'unknown')),
    budget_status TEXT CHECK (budget_status IN ('budget_available', 'financing_needed', 'budget_not_defined', 'not_discussed')),
    decision_role TEXT CHECK (decision_role IN ('decision_maker', 'influencer', 'technical_evaluator', 'purchasing_manager', 'owner', 'unknown')),
    
    -- Scoring & Temperature
    lead_score INTEGER NOT NULL DEFAULT 0,
    temperature TEXT NOT NULL DEFAULT 'COLD' CHECK (temperature IN ('HOT', 'WARM', 'COLD')),
    scoring_breakdown JSONB DEFAULT '[]'::jsonb,
    
    -- Pipeline & Sales
    sales_stage TEXT NOT NULL DEFAULT 'new_lead' CHECK (
        sales_stage IN ('new_lead', 'contacted', 'qualified', 'consultation', 'quotation_sent', 'negotiation', 'won', 'lost', 'on_hold')
    ),
    estimated_deal_value NUMERIC(12, 2) DEFAULT 0.00,
    quotation_date DATE,
    quotation_file_url TEXT,
    machine_sold TEXT,
    closed_at TIMESTAMPTZ,
    lost_reason TEXT,
    lost_notes TEXT,
    
    -- Ownership & Attribution
    sales_owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    exhibition_id UUID REFERENCES public.exhibitions(id) ON DELETE SET NULL,
    source TEXT NOT NULL DEFAULT 'exhibition_booth',
    tracking_code TEXT,
    
    -- Timestamps
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_contact_at TIMESTAMPTZ DEFAULT NOW(),
    next_follow_up_at TIMESTAMPTZ
);

-- ==============================================================================
-- 7. LEAD NOTES, ACTIVITIES & TIMELINE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- created, note_added, stage_change, call, whatsapp, follow_up_completed, quotation_sent, qr_scanned, magnet_shared, won, lost
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. FOLLOW-UPS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- phone_call, whatsapp, email, meeting, send_catalog, send_quotation, demo, factory_visit, financing, other
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    completion_notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. NOTIFICATIONS & PIPELINE STAGE AUDIT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pipeline_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    previous_stage TEXT NOT NULL,
    new_stage TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- follow_up_due, follow_up_overdue, lead_assigned, lead_hot, status_change
    related_lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. INDEXES FOR HIGH-PERFORMANCE SEARCH & DEDUPLICATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_normalized_phone ON public.leads(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_sales_owner_id ON public.leads(sales_owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_exhibition_id ON public.leads(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_leads_sales_stage ON public.leads(sales_stage);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON public.leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned_to ON public.follow_ups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_at ON public.follow_ups(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_qr_campaigns_tracking_code ON public.qr_campaigns(tracking_code);
CREATE INDEX IF NOT EXISTS idx_qr_campaigns_redirect_slug ON public.qr_campaigns(redirect_slug);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read profiles; Admins manage all; Users update own
CREATE POLICY "Profiles readable by authenticated users"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Leads Policies:
-- 1. Admins and Sales Managers see and update all leads
-- 2. Sales Reps see leads they own or created
CREATE POLICY "Admins and Managers have full lead access"
ON public.leads FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
    )
);

CREATE POLICY "Sales Reps can read assigned leads"
ON public.leads FOR SELECT
USING (
    sales_owner_id = auth.uid() OR created_by = auth.uid()
);

CREATE POLICY "Sales Reps can create leads"
ON public.leads FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
);

CREATE POLICY "Sales Reps can update assigned leads"
ON public.leads FOR UPDATE
USING (
    sales_owner_id = auth.uid() OR created_by = auth.uid()
);

-- Follow-ups:
CREATE POLICY "Admins and Managers have full follow_up access"
ON public.follow_ups FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
    )
);

CREATE POLICY "Sales Reps can access assigned follow_ups"
ON public.follow_ups FOR ALL
USING (
    assigned_to = auth.uid() OR created_by = auth.uid()
);

-- Public/Read-Only Catalogs for Sales Reps
CREATE POLICY "Machines are viewable by all"
ON public.machines FOR SELECT USING (true);

CREATE POLICY "Exhibitions are viewable by all"
ON public.exhibitions FOR SELECT USING (true);

CREATE POLICY "Sales Magnets are viewable by all"
ON public.sales_magnets FOR SELECT USING (true);

CREATE POLICY "QR Campaigns are viewable by all"
ON public.qr_campaigns FOR SELECT USING (true);
