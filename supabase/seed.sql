-- ==============================================================================
-- FALCON EXHIBITION CRM & SALES MAGNET SYSTEM
-- REALISTIC SEED DATA (EGYPTIAN INDUSTRIAL & EXHIBITION SCENARIOS)
-- ==============================================================================

-- 1. PROFILES (Admins, Managers, Sales Reps)
INSERT INTO public.profiles (id, full_name, email, role, avatar_url, phone, is_active, preferred_language)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Eng. Tarek Mansour', 'admin@falconcnc.com', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '+201001112233', true, 'en'),
    ('a0000000-0000-0000-0000-000000000002', 'Ahmed Hassan', 'ahmed.hassan@falconcnc.com', 'manager', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', '+201005556677', true, 'en'),
    ('a0000000-0000-0000-0000-000000000003', 'Mohamed Ibrahim', 'mohamed.ibrahim@falconcnc.com', 'sales_rep', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+201009998877', true, 'ar'),
    ('a0000000-0000-0000-0000-000000000004', 'Omar Khaled', 'omar.khaled@falconcnc.com', 'sales_rep', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+201003334455', true, 'en'),
    ('a0000000-0000-0000-0000-000000000005', 'Mahmoud Ali', 'mahmoud.ali@falconcnc.com', 'sales_rep', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+201007778899', true, 'ar')
ON CONFLICT (id) DO NOTHING;

-- 2. EXHIBITIONS
INSERT INTO public.exhibitions (id, name, event_type, location, start_date, end_date, status, target_leads, description)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'Cairo WoodShow 2026', 'Woodworking & Machinery Expo', 'CICC, Nasr City, Cairo', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', 'active', 150, 'The premier international woodworking and furniture machinery exhibition in North Africa.'),
    ('e0000000-0000-0000-0000-000000000002', 'MacTech Egypt 2026', 'Metalworking & Heavy Machinery Expo', 'EIEC, New Cairo', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '24 days', 'upcoming', 200, 'International exhibition for machine tools, industrial tools, welding and cutting equipment.')
ON CONFLICT (id) DO NOTHING;

-- 3. MACHINES CATALOG
INSERT INTO public.machines (id, name, model, category, description, specifications, applications, price_range, is_active)
VALUES
    ('m0000000-0000-0000-0000-000000000001', 'Falcon Pro-Router 1325', 'F-1325P', 'CNC Router', 'Heavy-duty 3-axis CNC router with 9.0kW Italian HSD spindle, vacuum bed, and Delta servo drives.', '{"working_area": "1300x2500x200mm", "spindle": "9.0kW Air-cooled", "controller": "DSP A11 / Syntec", "max_speed": "35 m/min"}'::jsonb, ARRAY['Custom Furniture', 'Kitchen Cabinets', 'Acoustic Panels', 'Architectural Millwork'], '$16,000 - $22,000', true),
    ('m0000000-0000-0000-0000-000000000002', 'Falcon ATC-Master 2030', 'F-2030ATC', 'CNC Router ATC', 'Industrial high-speed router with 12-tool linear auto-tool changer, dual vacuum pumps, and pneumatic positioning pins.', '{"working_area": "2000x3000x250mm", "spindle": "12.0kW ATC Spindle", "controller": "Syntec 6MB Industrial", "tool_magazine": "12 Tools Rotary"}'::jsonb, ARRAY['High Volume Furniture', 'Door Manufacturing', 'Mass Production Kitchens'], '$28,000 - $36,000', true),
    ('m0000000-0000-0000-0000-000000000003', 'Falcon Fiber-Cut 3015', 'FC-3015-3KW', 'Fiber Laser', 'Ultra-precise fiber laser cutting system with Raycus/Max 3000W generator, Swiss Raytools head, and dual exchange pallet table.', '{"cutting_area": "3000x1500mm", "laser_power": "3000W (Max 6000W)", "sheet_thickness": "Carbon steel up to 20mm, SS 10mm", "acceleration": "1.5G"}'::jsonb, ARRAY['Sheet Metal Fabrication', 'Electrical Enclosures', 'Automotive Brackets', 'Steel Structures'], '$38,000 - $52,000', true),
    ('m0000000-0000-0000-0000-000000000004', 'Falcon Tube-Cut 6020', 'TC-6020-2KW', 'Fiber Laser Tube', 'Professional automatic chuck fiber laser for round, square, and rectangular metal pipes.', '{"pipe_diameter": "20-220mm", "pipe_length": "6000mm", "laser_power": "2000W", "chuck_type": "Pneumatic Dual Chuck"}'::jsonb, ARRAY['Fitness Equipment', 'Metal Furniture', 'Piping & Railings', 'Display Racks'], '$32,000 - $44,000', true),
    ('m0000000-0000-0000-0000-000000000005', 'Falcon Heavy-Plasma 1530', 'HP-1530-HD', 'CNC Plasma', 'High definition CNC plasma cutting table with Hypertherm Powermax/XPR and automatic torch height control.', '{"working_area": "1500x3000mm", "power_source": "Hypertherm 105A / 125A", "cutting_thickness": "Pierce up to 25mm, Edge 38mm", "table": "Water Bed / Down-draft"}'::jsonb, ARRAY['Heavy Steel Fabrication', 'Truck Body Building', 'Shipbuilding & Storage Tanks'], '$14,000 - $19,000', true),
    ('m0000000-0000-0000-0000-000000000006', 'Falcon Ultra-CO2 Laser 1390', 'CO2-1390-150W', 'CO2 Laser', 'Precision laser engraver and cutter for acrylic, wood, MDF, and signage plastics.', '{"working_area": "1300x900mm", "laser_tube": "150W RECI W6", "chiller": "CW-5200 Included", "precision": "0.01mm"}'::jsonb, ARRAY['Signage & Acrylic Letters', 'Trophies & Awards', 'Crafts & Giftware', 'Architectural Models'], '$6,500 - $9,000', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SALES MAGNETS
INSERT INTO public.sales_magnets (id, title, description, category, content_type, file_url, external_url, machine_category, downloads_count, shares_count)
VALUES
    ('s0000000-0000-0000-0000-000000000001', '2026 Falcon CNC Machine Selection Guide', 'Comprehensive guide detailing spindle powers, drive systems, and software matching for modern Egyptian workshops.', 'Guide', 'pdf', 'https://falconcnc.com/downloads/falcon-machine-selection-guide-2026.pdf', 'https://falconcnc.com/guides/buying', 'CNC Router', 142, 89),
    ('s0000000-0000-0000-0000-000000000002', 'Full CNC Machinery & Fiber Laser Catalog', 'Official Falcon CNC 48-page catalog with complete technical specs, cutting charts, and option packages.', 'Catalog', 'pdf', 'https://falconcnc.com/downloads/falcon-full-catalog-2026.pdf', 'https://falconcnc.com/catalog', 'Fiber Laser', 215, 134),
    ('s0000000-0000-0000-0000-000000000003', 'CNC Production Cost & ROI Calculator', 'Spreadsheet and mobile calculator to calculate cost per meter cut, sheet utilization, and break-even timeline in EGP.', 'Calculator', 'calculator', NULL, 'https://falconcnc.com/tools/roi-calculator', 'CNC Router', 98, 76),
    ('s0000000-0000-0000-0000-000000000004', 'Factory Setup & Electrical Requirements Checklist', 'Power ratings (kVA), air compressor bar requirements, dust extraction, and ground leveling guide before machine delivery.', 'Checklist', 'pdf', 'https://falconcnc.com/downloads/falcon-factory-readiness-checklist.pdf', 'https://falconcnc.com/checklist', 'General', 167, 105),
    ('s0000000-0000-0000-0000-000000000005', 'High-Speed 3kW Fiber Laser Live Cut Demo Video', 'Watch Falcon Fiber-Cut 3015 cutting 12mm carbon steel and 6mm stainless steel in real-time.', 'Demo Video', 'video', NULL, 'https://www.youtube.com/watch?v=falcon_fiber_demo', 'Fiber Laser', 320, 180)
ON CONFLICT (id) DO NOTHING;

-- 5. WHATSAPP TEMPLATES
INSERT INTO public.whatsapp_templates (id, name, template_type, message_body)
VALUES
    ('w0000000-0000-0000-0000-000000000001', 'General Booth Inquiry', 'general', 'Hello Falcon CNC,\n\nI visited your exhibition booth and would like to know more about your CNC machines.\nPlease contact me with details.\n\n[{{TRACKING_CODE}}]'),
    ('w0000000-0000-0000-0000-000000000002', 'Catalog Request', 'catalog', 'Hello Falcon CNC,\n\nI am interested in receiving your complete CNC Machine & Fiber Laser catalog.\nPlease send me the available models and technical specifications.\n\n[{{TRACKING_CODE}}]'),
    ('w0000000-0000-0000-0000-000000000003', 'Pricing & Quotation Offer', 'pricing', 'Hello Falcon CNC,\n\nI stopped by your booth and would like to request an official quotation and current exhibition offers for {{MACHINE_NAME}}.\n\n[{{TRACKING_CODE}}]'),
    ('w0000000-0000-0000-0000-000000000004', 'Technical Consultation', 'consultation', 'Hello Falcon CNC,\n\nI would like to arrange a technical consultation with an engineer to review my factory production needs and machine sizing.\n\n[{{TRACKING_CODE}}]'),
    ('w0000000-0000-0000-0000-000000000005', 'Live Machine Demo Request', 'demo', 'Hello Falcon CNC,\n\nI would like to schedule a live demonstration of your {{MACHINE_NAME}} at your showroom.\n\n[{{TRACKING_CODE}}]'),
    ('w0000000-0000-0000-0000-000000000006', 'Financing & Installment Inquiry', 'financing', 'Hello Falcon CNC,\n\nI would like to know more about the financing and installment payment options available for purchasing machinery.\n\n[{{TRACKING_CODE}}]')
ON CONFLICT (id) DO NOTHING;

-- 6. REALISTIC LEADS
INSERT INTO public.leads (
    id, full_name, phone, normalized_phone, email, company_name, job_title, city, business_sector,
    factory_status, owns_cnc, current_machines, interested_machine_names,
    purchase_intent, purchase_timeline, budget_status, decision_role,
    lead_score, temperature, sales_stage, estimated_deal_value, quotation_date,
    sales_owner_id, exhibition_id, source, tracking_code, created_at, next_follow_up_at
)
VALUES
    (
        'l0000000-0000-0000-0000-000000000001',
        'Haj Mahmoud El-Naggar',
        '+20 100 123 4567',
        '+201001234567',
        'elnaggar.furniture@gmail.com',
        'El-Naggar Modern Furniture',
        'Owner & Managing Director',
        'Damietta',
        'Furniture Manufacturing',
        'yes',
        true,
        'Old Stepcraft 3-axis router (slow, breaking down)',
        ARRAY['Falcon ATC-Master 2030'],
        'ready_to_buy',
        'within_30_days',
        'budget_available',
        'owner',
        95,
        'HOT',
        'quotation_sent',
        32000.00,
        CURRENT_DATE,
        'a0000000-0000-0000-0000-000000000003', -- Mohamed Ibrahim
        'e0000000-0000-0000-0000-000000000001', -- Cairo WoodShow
        'exhibition_booth',
        'FALCON-CWS26-S01-ATC',
        NOW() - INTERVAL '3 hours',
        NOW() + INTERVAL '1 day'
    ),
    (
        'l0000000-0000-0000-0000-000000000002',
        'Eng. Sameh Abdel-Fattah',
        '+20 111 888 7766',
        '+201118887766',
        'sameh@alahram-metal.com',
        'Al-Ahram Facades & Architectural Metal',
        'Technical & Factory Manager',
        '6th of October',
        'Metal Fabrication',
        'yes',
        true,
        'Mechanical press brakes and old plasma table',
        ARRAY['Falcon Fiber-Cut 3015', 'Falcon Tube-Cut 6020'],
        'ready_to_buy',
        '1_3_months',
        'budget_available',
        'decision_maker',
        85,
        'HOT',
        'consultation',
        48000.00,
        NULL,
        'a0000000-0000-0000-0000-000000000004', -- Omar Khaled
        'e0000000-0000-0000-0000-000000000001',
        'exhibition_booth',
        'FALCON-CWS26-S02-FL',
        NOW() - INTERVAL '5 hours',
        NOW() + INTERVAL '2 days'
    ),
    (
        'l0000000-0000-0000-0000-000000000003',
        'Kareem El-Banna',
        '+20 122 456 7890',
        '+201224567890',
        'kareem@delta-kitchens.eg',
        'Delta Kitchen Industries',
        'Purchasing Manager',
        '10th of Ramadan',
        'Kitchen Manufacturing',
        'yes',
        false,
        'Traditional sliding table saws only',
        ARRAY['Falcon Pro-Router 1325'],
        'comparing_options',
        '1_3_months',
        'financing_needed',
        'purchasing_manager',
        65,
        'WARM',
        'qualified',
        18500.00,
        NULL,
        'a0000000-0000-0000-0000-000000000003',
        'e0000000-0000-0000-0000-000000000001',
        'exhibition_booth',
        'FALCON-CWS26-S01-ROUTER',
        NOW() - INTERVAL '8 hours',
        NOW() + INTERVAL '3 days'
    ),
    (
        'l0000000-0000-0000-0000-000000000004',
        'Moustafa Radwan',
        '+20 102 334 4556',
        '+201023344556',
        'radwan.steel@yahoo.com',
        'Radwan Heavy Steel Works',
        'General Manager',
        'Alexandria',
        'Metal Fabrication',
        'yes',
        true,
        'Manual oxy-fuel cutting torches',
        ARRAY['Falcon Heavy-Plasma 1530'],
        'comparing_options',
        '3_6_months',
        'budget_available',
        'decision_maker',
        55,
        'WARM',
        'contacted',
        16000.00,
        NULL,
        'a0000000-0000-0000-0000-000000000005', -- Mahmoud Ali
        'e0000000-0000-0000-0000-000000000001',
        'exhibition_booth',
        'FALCON-CWS26-S03-PLASMA',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '4 days'
    ),
    (
        'l0000000-0000-0000-0000-000000000005',
        'Youssef Farag',
        '+20 109 998 8112',
        '+201099988112',
        'youssef.design@gmail.com',
        'Farag Signage & Display Studio',
        'Creative Director / Founder',
        'Cairo',
        'Advertising & Signage',
        'planning',
        false,
        'None (Outsourcing to local CNC shops)',
        ARRAY['Falcon Ultra-CO2 Laser 1390'],
        'planning_future',
        '6_12_months',
        'budget_not_defined',
        'owner',
        30,
        'COLD',
        'new_lead',
        7500.00,
        NULL,
        'a0000000-0000-0000-0000-000000000003',
        'e0000000-0000-0000-0000-000000000001',
        'exhibition_booth',
        'FALCON-CWS26-S01-CO2',
        NOW() - INTERVAL '1 day',
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- 7. FOLLOW-UPS
INSERT INTO public.follow_ups (id, lead_id, type, title, description, scheduled_at, assigned_to, priority, status)
VALUES
    (
        'f0000000-0000-0000-0000-000000000001',
        'l0000000-0000-0000-0000-000000000001',
        'phone_call',
        'Quotation Review Call with Haj Mahmoud',
        'Call to confirm receipt of official quote for Falcon ATC-Master 2030 and address spindle upgrade options.',
        NOW() + INTERVAL '1 day',
        'a0000000-0000-0000-0000-000000000003',
        'high',
        'pending'
    ),
    (
        'f0000000-0000-0000-0000-000000000002',
        'l0000000-0000-0000-0000-000000000002',
        'factory_visit',
        'Technical Site Survey in 6th of October',
        'Visit Eng. Sameh at Al-Ahram factory to inspect power substation capacity and layout for 3kW Fiber Laser.',
        NOW() + INTERVAL '2 days',
        'a0000000-0000-0000-0000-000000000004',
        'high',
        'pending'
    ),
    (
        'f0000000-0000-0000-0000-000000000003',
        'l0000000-0000-0000-0000-000000000003',
        'whatsapp',
        'Send Installment Plan & Catalog via WhatsApp',
        'Send 12-month zero-interest payment breakdown for Falcon Pro-Router 1325.',
        NOW() - INTERVAL '2 hours', -- OVERDUE for demonstration!
        'a0000000-0000-0000-0000-000000000003',
        'medium',
        'pending'
    )
ON CONFLICT (id) DO NOTHING;

-- 8. LEAD NOTES
INSERT INTO public.lead_notes (id, lead_id, author_id, author_name, note, created_at)
VALUES
    ('n0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Mohamed Ibrahim', 'Met Haj Mahmoud at Cairo WoodShow booth B14. Very impressed by the ATC tool changer demonstration. He produces bedroom sets for Saudi export and urgently needs to double his output before Ramadan.', NOW() - INTERVAL '3 hours'),
    ('n0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Omar Khaled', 'Eng. Sameh has 380V 3-phase power ready. Needs sample cut of 8mm stainless steel perforated architectural screens before placing deposit.', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- 9. LEAD ACTIVITIES
INSERT INTO public.lead_activities (id, lead_id, activity_type, title, description, metadata, created_by, created_at)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000001', 'created', 'Lead Captured at Booth', 'Captured at Cairo WoodShow 2026 by Mohamed Ibrahim in 45 seconds.', '{"source": "exhibition"}'::jsonb, 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 hours'),
    ('c0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000001', 'quotation_sent', 'Quotation #Q-2026-089 Sent', 'Official proposal for Falcon ATC-Master 2030 ($32,000) generated and shared.', '{"value": 32000}'::jsonb, 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 hour'),
    ('c0000000-0000-0000-0000-000000000003', 'l0000000-0000-0000-0000-000000000002', 'created', 'Lead Captured at Booth', 'Captured at Cairo WoodShow 2026 by Omar Khaled.', '{"source": "exhibition"}'::jsonb, 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;
