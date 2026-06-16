-- Migration: 00010_phase1_stock_ledger
-- Description: Phase 1 - Immutable Stock Ledger and Procurement Lifecycle

-- 1. MATERIAL REQUESTS (The start of procurement)
CREATE TABLE IF NOT EXISTS public.material_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., MAT-REQ-2026-0001
    transaction_date DATE DEFAULT CURRENT_DATE,
    schedule_date DATE,
    type VARCHAR(50) DEFAULT 'Purchase', -- Purchase, Transfer, Issue
    status VARCHAR(50) DEFAULT 'Draft',
    requested_by UUID REFERENCES public.employees(id),
    set_warehouse UUID REFERENCES public.warehouses(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.material_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.material_requests(id) ON DELETE CASCADE,
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    qty DECIMAL(15, 2) NOT NULL,
    uom VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PURCHASE RECEIPTS (The physical intake)
CREATE TABLE IF NOT EXISTS public.purchase_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., MAT-REC-2026-0001
    supplier_id UUID REFERENCES public.suppliers(id),
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    set_warehouse UUID REFERENCES public.warehouses(id),
    status VARCHAR(50) DEFAULT 'Draft',
    grand_total DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.purchase_receipts(id) ON DELETE CASCADE,
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    qty DECIMAL(15, 2) NOT NULL,
    rate DECIMAL(15, 2) DEFAULT 0,
    amount DECIMAL(15, 2) DEFAULT 0,
    warehouse_id UUID REFERENCES public.warehouses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STOCK LEDGER ENTRIES (The source of truth)
CREATE TABLE IF NOT EXISTS public.stock_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    warehouse_id UUID REFERENCES public.warehouses(id),
    actual_qty DECIMAL(15, 2) NOT NULL, -- Positive for intake, negative for consumption
    voucher_type VARCHAR(50) NOT NULL, -- Purchase Receipt, Delivery Note, Stock Entry, etc.
    voucher_no VARCHAR(100) NOT NULL,
    valuation_rate DECIMAL(15, 2) DEFAULT 0,
    posting_date DATE DEFAULT CURRENT_DATE,
    posting_time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PURCHASE INVOICES (The financial trigger)
CREATE TABLE IF NOT EXISTS public.purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., ACC-INV-2026-0001
    supplier_id UUID REFERENCES public.suppliers(id),
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Unpaid',
    grand_total DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. STOCK UPDATE LOGIC (Triggers)

-- Function to update 'bins' based on stock ledger entries
CREATE OR REPLACE FUNCTION public.update_bin_qty()
RETURNS TRIGGER AS $$
BEGIN
    -- Update existing bin or create a new one
    INSERT INTO public.bins (item_code, warehouse_id, actual_qty)
    VALUES (NEW.item_code, NEW.warehouse_id, NEW.actual_qty)
    ON CONFLICT (item_code, warehouse_id) 
    DO UPDATE SET actual_qty = public.bins.actual_qty + EXCLUDED.actual_qty;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_stock_ledger_entry
    AFTER INSERT ON public.stock_ledger_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_bin_qty();

-- 6. WORKFLOW LOGIC (Submit Receipt)

CREATE OR REPLACE FUNCTION public.submit_purchase_receipt(p_id UUID)
RETURNS VOID AS $$
DECLARE
    r_item RECORD;
    v_name VARCHAR(100);
BEGIN
    SELECT name INTO v_name FROM public.purchase_receipts WHERE id = p_id;
    
    -- Iterate through items and create ledger entries
    FOR r_item IN SELECT * FROM public.purchase_receipt_items WHERE parent_id = p_id LOOP
        INSERT INTO public.stock_ledger_entries (item_code, warehouse_id, actual_qty, voucher_type, voucher_no, valuation_rate)
        VALUES (r_item.item_code, r_item.warehouse_id, r_item.qty, 'Purchase Receipt', v_name, r_item.rate);
    END LOOP;

    -- Update status
    UPDATE public.purchase_receipts SET status = 'Completed' WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RE-ALIGN BINS (Make unique constraint for conflict handling)
ALTER TABLE public.bins DROP CONSTRAINT IF EXISTS bins_item_code_warehouse_id_key;
ALTER TABLE public.bins ADD CONSTRAINT bins_item_code_warehouse_id_key UNIQUE (item_code, warehouse_id);

-- 8. RLS ENFORCEMENT
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('material_requests', 'material_request_items', 'purchase_receipts', 'purchase_receipt_items', 'stock_ledger_entries', 'purchase_invoices')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('CREATE POLICY "Allow anon all access" ON public.%I FOR ALL USING (true)', t);
    END LOOP;
END $$;
