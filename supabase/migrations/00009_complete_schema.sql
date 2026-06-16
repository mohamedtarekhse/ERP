-- Migration: 00009_complete_schema (Fixed)
-- Description: Full schema synchronization to match the frontend expectations.

-- 1. HR MODULE EXTENSIONS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed basic HR data
INSERT INTO public.departments (name) VALUES ('Operations'), ('Engineering'), ('HSE'), ('Supply Chain'), ('HR'), ('Finance'), ('IT'), ('Legal'), ('CRM') ON CONFLICT DO NOTHING;
INSERT INTO public.designations (name) VALUES ('Drilling Superintendent'), ('Reservoir Engineer'), ('HSE Inspector'), ('Procurement Manager'), ('HR Business Partner'), ('Toolpusher'), ('Financial Controller'), ('Geologist'), ('Systems Administrator'), ('Legal Counsel'), ('Sales Director') ON CONFLICT DO NOTHING;

-- Update employees table structure safely
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='email') THEN
        ALTER TABLE public.employees RENAME COLUMN email TO company_email;
    END IF;
END $$;

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS designation_id UUID REFERENCES public.designations(id);
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS date_of_joining DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS branch VARCHAR(100);

-- 2. CRM MODULE REFACTOR
CREATE TABLE IF NOT EXISTS public.crm_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    territory VARCHAR(100),
    rating VARCHAR(50),
    annual_revenue DECIMAL(15, 2),
    block_ref VARCHAR(100),
    account_owner UUID REFERENCES public.employees(id),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'Prospect',
    probability INTEGER DEFAULT 10,
    close_date DATE,
    owner_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE CASCADE,
    activity_type VARCHAR(50),
    reference_date DATE DEFAULT CURRENT_DATE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ASSET COMPLIANCE REFACTOR
CREATE TABLE IF NOT EXISTS public.equipment_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_name VARCHAR(255) NOT NULL,
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    warehouse_id UUID, 
    status VARCHAR(50) DEFAULT 'In Service',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update certificates table safely
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS equipment_asset_id UUID REFERENCES public.equipment_assets(id);
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS workflow_state VARCHAR(50) DEFAULT 'Valid';
-- Note: 'status' column was added in a previous turn to schema.sql, so we use IF NOT EXISTS just in case.
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Valid';

-- 4. SUPPLY CHAIN MODULE REFACTOR
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.item_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_group_id UUID REFERENCES public.item_groups(id),
    uom VARCHAR(20) DEFAULT 'Nos',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    warehouse_id UUID REFERENCES public.warehouses(id),
    actual_qty DECIMAL(15, 2) DEFAULT 0,
    reorder_level DECIMAL(15, 2) DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update purchase_orders safely
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS workflow_state VARCHAR(50) DEFAULT 'Draft';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Normal';
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS grand_total DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES public.employees(id);
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS set_warehouse UUID REFERENCES public.warehouses(id);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_code VARCHAR(100),
    item_name VARCHAR(255),
    qty DECIMAL(15, 2) DEFAULT 1,
    uom VARCHAR(20),
    rate DECIMAL(15, 2) DEFAULT 0,
    amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    role_id UUID REFERENCES public.roles(id),
    subject TEXT,
    document_type VARCHAR(50),
    document_id UUID,
    type VARCHAR(20) DEFAULT 'Info', -- Info, Success, Warning, Error
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. VIEWS (KPIs and Computed States)

CREATE OR REPLACE VIEW public.v_hr_kpis AS
SELECT 
    (SELECT COUNT(*) FROM public.employees) as total_employees,
    (SELECT COUNT(*) FROM public.leave_requests WHERE status = 'Pending') as pending_leave,
    (SELECT COUNT(*) FROM public.employees WHERE status = 'Active') as active_staff;

CREATE OR REPLACE VIEW public.v_crm_kpis AS
SELECT 
    (SELECT COUNT(*) FROM public.crm_organizations) as total_accounts,
    (SELECT COALESCE(SUM(value), 0) FROM public.crm_deals WHERE status != 'Closed') as pipeline_value,
    (SELECT COUNT(*) FROM public.crm_deals WHERE status = 'Prospect') as open_deals;

CREATE OR REPLACE VIEW public.v_certs_with_status AS
SELECT 
    c.*,
    a.asset_name,
    a.asset_tag,
    (c.expiry_date - CURRENT_DATE) as days_remaining,
    CASE 
        WHEN c.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN c.expiry_date <= (CURRENT_DATE + INTERVAL '30 days') THEN 'Expiring Soon'
        ELSE 'Valid'
    END as computed_status
FROM public.certificates c
LEFT JOIN public.equipment_assets a ON c.equipment_asset_id = a.id;

CREATE OR REPLACE VIEW public.v_cert_kpis AS
SELECT 
    (SELECT COUNT(*) FROM public.v_certs_with_status WHERE computed_status = 'Expired') as expired_count,
    (SELECT COUNT(*) FROM public.v_certs_with_status WHERE computed_status = 'Expiring Soon') as expiring_soon_count,
    (SELECT COUNT(*) FROM public.v_certs_with_status WHERE computed_status = 'Valid') as valid_count;

CREATE OR REPLACE VIEW public.v_bins_with_status AS
SELECT 
    b.*,
    i.item_name,
    CASE 
        WHEN b.actual_qty <= b.reorder_level THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status
FROM public.bins b
JOIN public.items i ON b.item_code = i.item_code;

CREATE OR REPLACE VIEW public.v_sc_kpis AS
SELECT 
    (SELECT COUNT(*) FROM public.purchase_orders WHERE workflow_state = 'Draft') as draft_pos,
    (SELECT COUNT(*) FROM public.purchase_orders WHERE workflow_state = 'Pending Approval') as pending_approvals,
    (SELECT COUNT(*) FROM public.v_bins_with_status WHERE stock_status = 'Low Stock') as low_stock_items;

-- 7. RPCs (Functions for Frontend)

CREATE OR REPLACE FUNCTION public.renew_certificate(p_id UUID, p_new_expiry DATE, p_new_issue DATE)
RETURNS VOID AS $$
BEGIN
    UPDATE public.certificates 
    SET expiry_date = p_new_expiry, 
        issue_date = p_new_issue,
        workflow_state = 'Valid'
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.submit_purchase_order(p_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.purchase_orders SET workflow_state = 'Pending Approval' WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.approve_purchase_order(p_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.purchase_orders SET workflow_state = 'Approved' WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.mark_po_received(p_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.purchase_orders SET workflow_state = 'Received' WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Final RLS Re-Enablement
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon all access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow anon all access" ON public.%I FOR ALL USING (true)', t);
    END LOOP;
END $$;
