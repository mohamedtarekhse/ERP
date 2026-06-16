-- Migration: 00011_phase2_transactional_sales
-- Description: Phase 2 - Transactional Sales and CRM Workflow

-- 1. LEADS (Pre-Account Management)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- Full Name or Organization
    email VARCHAR(255),
    phone VARCHAR(50),
    source VARCHAR(100), -- Campaign, Referral, Website, etc.
    status VARCHAR(50) DEFAULT 'Lead', -- Lead, Open, Interested, Converted, Do Not Contact
    owner_id UUID REFERENCES public.employees(id),
    territory VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. QUOTATIONS
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., QT-2026-0001
    quotation_to VARCHAR(50) DEFAULT 'Lead', -- Lead or Organization
    lead_id UUID REFERENCES public.leads(id),
    organization_id UUID REFERENCES public.crm_organizations(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Sent, Ordered, Lost, Expired
    grand_total DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    owner_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    qty DECIMAL(15, 2) NOT NULL,
    rate DECIMAL(15, 2) DEFAULT 0,
    amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SALES ORDERS
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., SO-2026-0001
    organization_id UUID REFERENCES public.crm_organizations(id) NOT NULL,
    quotation_id UUID REFERENCES public.quotations(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    workflow_state VARCHAR(50) DEFAULT 'Draft', -- Draft, Approved, On Hold, To Deliver and Bill, Completed, Cancelled
    grand_total DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    owner_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    qty DECIMAL(15, 2) NOT NULL,
    rate DECIMAL(15, 2) DEFAULT 0,
    amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DELIVERY NOTES (Affects Physical Stock)
CREATE TABLE IF NOT EXISTS public.delivery_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., DN-2026-0001
    organization_id UUID REFERENCES public.crm_organizations(id) NOT NULL,
    sales_order_id UUID REFERENCES public.sales_orders(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    set_warehouse UUID REFERENCES public.warehouses(id),
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Completed, Cancelled
    grand_total DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_note_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    qty DECIMAL(15, 2) NOT NULL,
    rate DECIMAL(15, 2) DEFAULT 0,
    amount DECIMAL(15, 2) DEFAULT 0,
    warehouse_id UUID REFERENCES public.warehouses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SALES INVOICES (Financial)
CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., SINV-2026-0001
    organization_id UUID REFERENCES public.crm_organizations(id) NOT NULL,
    sales_order_id UUID REFERENCES public.sales_orders(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Unpaid', -- Unpaid, Partially Paid, Paid, Overdue, Cancelled
    grand_total DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. WORKFLOW LOGIC (Submit Delivery Note -> Stock Ledger)

CREATE OR REPLACE FUNCTION public.submit_delivery_note(p_id UUID)
RETURNS VOID AS $$
DECLARE
    r_item RECORD;
    v_name VARCHAR(100);
BEGIN
    SELECT name INTO v_name FROM public.delivery_notes WHERE id = p_id;
    
    -- Iterate through items and create NEGATIVE ledger entries (Deduction)
    FOR r_item IN SELECT * FROM public.delivery_note_items WHERE parent_id = p_id LOOP
        INSERT INTO public.stock_ledger_entries (item_code, warehouse_id, actual_qty, voucher_type, voucher_no, valuation_rate)
        VALUES (r_item.item_code, r_item.warehouse_id, -r_item.qty, 'Delivery Note', v_name, r_item.rate);
    END LOOP;

    -- Update status
    UPDATE public.delivery_notes SET status = 'Completed' WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. KPI VIEW UPDATES
CREATE OR REPLACE VIEW public.v_sales_kpis AS
SELECT 
    (SELECT COUNT(*) FROM public.leads WHERE status != 'Converted') as open_leads,
    (SELECT COALESCE(SUM(grand_total), 0) FROM public.sales_orders WHERE workflow_state IN ('Draft', 'Approved')) as active_order_value,
    (SELECT COUNT(*) FROM public.sales_invoices WHERE status = 'Unpaid') as pending_invoices;

-- 8. RLS ENFORCEMENT
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('leads', 'quotations', 'quotation_items', 'sales_orders', 'sales_order_items', 'delivery_notes', 'delivery_note_items', 'sales_invoices')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon all access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow anon all access" ON public.%I FOR ALL USING (true)', t);
    END LOOP;
END $$;
