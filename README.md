# Falcon Exhibition CRM & Sales Magnet System

> **A lightweight, mobile-first sales CRM and exhibition lead management platform built specifically for Falcon CNC Machinery.** Designed to convert high-footfall exhibition traffic (Cairo WoodShow, MacTech, etc.) into qualified B2B sales opportunities in under 60 seconds.

![Falcon CNC](https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200)

---

## 🌟 Executive Summary & Mission

Traditional machinery exhibitions suffer from lost business cards, forgotten customer requirements, unorganized Excel sheets, duplicate leads, and zero visibility into booth ROI.

**Falcon Exhibition CRM** solves this directly on the exhibition floor:
- ⚡ **Sub-60-Second Lead Capture**: Mobile-optimized rapid capture mode with large touch targets and phone number input so sales reps don't lose eye contact with prospects.
- 🔍 **Real-Time Duplicate Prevention**: Instant phone number normalization (`+20 10...`) and lookup to prevent duplicate records and display existing interaction history.
- 🧲 **Sales Magnet Center**: Curated library of digital CNC machine guides, calculators, and catalogs to share with visitors via WhatsApp instead of simply asking for a phone number.
- 📱 **WhatsApp QR Center**: Dynamic official `https://wa.me/` QR codes with pre-filled messages and unique campaign tracking codes (`[FALCON-CWS26-S01-CAT]`) ready for large-screen booth displays.
- 🧠 **Configurable B2B Qualification & Lead Scoring**: Automatic 0–100 score engine mapping to **HOT** (70–100), **WARM** (40–69), and **COLD** (0–39) with transparent "Why this score was assigned" breakdown.
- 📊 **Kanban Sales Pipeline**: 9-stage pipeline with strict deal-closing rules (won deals require closing date, value, and machine model; lost deals require reason).
- 📅 **Dedicated Follow-up Center**: Due Today, Overdue, and Upcoming views with one-tap WhatsApp and phone call triggers.
- 🌐 **Native Dual-Language & RTL**: Full English (LTR) and Arabic (RTL `العربية`) support with user-persisted preference.
- 🛡️ **Role-Based Security & Permissions**: Admin, Sales Manager, and Sales Representative views with row-level restrictions.

---

## 🏗️ Technology Stack

- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **Language**: TypeScript 5
- **UI & Styling**: Tailwind CSS, Radix UI primitives, Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth, Storage)
- **QR Engine**: `qrcode.react` (SVG / PNG generation)
- **Offline / Local Persistence**: Dual-mode data layer (real Supabase client with seamless local browser state & offline queue fallback)
- **Deployment**: Vercel & GitHub

---

## 📱 User Roles & Permission Matrix

| Role | Permissions & Scope |
|---|---|
| **Admin** | Full system control. Manages users, exhibitions, machine catalog, sales magnets, WhatsApp configurations, system settings, exports all data. |
| **Sales Manager** | High-level operations. Views all company leads, assigns/reassigns leads, monitors sales reps, inspects HOT leads and overdue follow-ups, exports team reports. |
| **Sales Representative** | Field execution. Captures leads in &lt;60s, views assigned leads, qualifies prospects, completes follow-up tasks, generates WhatsApp QRs, shares sales magnets. Cannot delete leads or export company data. |

> **Live Role Switcher**: A quick switcher pill is built into the top navigation bar during development and testing to preview Admin, Manager, and Sales Rep perspectives instantly.

---

## 🗄️ Database Architecture & Supabase Setup

The database schema is fully normalized and located in `supabase/schema.sql`.

### Core Tables:
1. `profiles`: User accounts, roles (`admin`, `manager`, `sales_rep`), avatar, language preference.
2. `exhibitions`: Exhibition details, locations, dates, target lead counters.
3. `machines`: CNC machine catalog (Routers, ATC Routers, Fiber Lasers, Plasma cutters, CO2 Lasers) with specs and price ranges.
4. `sales_magnets`: Digital content library (PDF guides, ROI calculator, video demo links).
5. `whatsapp_templates`: Pre-approved message templates for catalog, pricing, demo, consultation.
6. `qr_campaigns`: Dynamic booth QR configurations with unique tracking codes and click counters.
7. `leads`: Central lead registry with normalized phone numbers, qualification scores, temperature, sales stage, and ownership.
8. `lead_notes`: Multiple chronological notes per lead with author attribution.
9. `lead_activities`: Comprehensive audit timeline (created, stage change, call, quote sent, won, lost).
10. `follow_ups`: Scheduled follow-up tasks with priority, status, and completion summaries.
11. `notifications`: In-app alerts for overdue tasks and new HOT leads.

### Deploying the Database to Supabase:
1. Go to your [Supabase Dashboard](https://supabase.com).
2. Create a new project.
3. Navigate to the **SQL Editor**.
4. Paste and execute the contents of `supabase/schema.sql`.
5. (Optional) Run `supabase/seed.sql` to populate sample Egyptian machinery data (Cairo WoodShow, MacTech, CNC Routers, Fiber Lasers, Egyptian industrial leads in Damietta, 6th of October, 10th of Ramadan).

---

## 🚀 Getting Started & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/your-org/falcon-crm.git
cd falcon-crm
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Company Official WhatsApp Number (without + or spaces, e.g. Egypt 201001112233)
NEXT_PUBLIC_FALCON_WHATSAPP_PHONE=201001112233

# Base App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Zero-Config Demo Mode**: If Supabase variables are left empty, the application automatically runs in **Resilient Exhibition Offline Mode** with full CRUD, local caching, and rich realistic Egyptian exhibition data.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📐 Key Workflows

### 1. Sub-60s Exhibition Lead Capture
- Sales rep taps the **+ <60s** button (prominently located in the mobile bottom bar or desktop navbar).
- Inputs **Customer Name** and **Mobile Number** (numeric mobile keypad auto-opens).
- Phone number is normalized on the fly; if a duplicate contact exists in the database, a warning banner appears with one-tap options to view existing record or log an interaction.
- Selects **Interested Machine** and **Temperature** (HOT 🔥, WARM ☀️, COLD ❄️).
- Taps **Save Lead**.
- Post-save action screen offers:
  1. *Schedule Follow-up Task*
  2. *Generate WhatsApp QR*
  3. *Open Full Profile*
  4. *Capture Another Lead*

### 2. WhatsApp QR Magnet Sharing
- Selects an exhibition and CNC machine or Sales Magnet.
- The system generates an official WhatsApp click-to-chat URL:
  `https://wa.me/201001112233?text=Hello%20Falcon%20CNC...%20[FALCON-CWS26-S01-CAT]`
- Rep taps **Full Screen Mode** for a high-contrast, clean booth tablet display.
- Visitor scans QR code with their camera; WhatsApp launches with the pre-filled message; visitor taps Send.

### 3. Transparent Lead Qualification & Scoring
- Leads receive a score from 0 to 100 based on:
  - *Purchase Timeline*: Within 30 days (+30), 1–3 months (+25), 3–6 months (+15)
  - *Purchase Intent*: Ready to buy (+25), Comparing options (+15), Planning future (+10)
  - *Budget Readiness*: Budget available (+15), Financing needed (+10)
  - *Machine Interest*: Specific machine selected (+10)
  - *Business Infrastructure*: Operational factory (+10), Under construction (+8)
- Tapping on the score badge opens the **Scoring Breakdown Inspector** displaying the exact reasons points were assigned.

---

## 📦 Deployment to Vercel

1. Push your code to your GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In **Project Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_FALCON_WHATSAPP_PHONE`
4. Click **Deploy**.

---

## 📄 License
Proprietary software built for **Falcon CNC Machinery**. All rights reserved.
