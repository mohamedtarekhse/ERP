-- Migration: 00012_phase3_subcontracting
-- Description: Phase 3 - Subcontracting and Manufacturing (BOMs & Material Transfer)

-- 1. BILL OF MATERIALS (BOM)
CREATE TABLE IF NOT EXISTS public.bom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., BOM-ITEM-001
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    quantity DECIMAL(15, 2) DEFAULT 1,
    total_cost DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.bom(id) ON DELETE CASCADE,
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    qty DECIMAL(15, 2) NOT NULL,
    uom VARCHAR(20),
    rate DECIMAL(15, 2) DEFAULT 0,
    amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SUBCONTRACTING EXTENSIONS
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS is_subcontracted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS supplier_warehouse UUID REFERENCES public.warehouses(id);

-- 3. STOCK ENTRIES (For Material Transfer)
CREATE TABLE IF NOT EXISTS public.stock_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., MAT-ENT-2026-0001
    purpose VARCHAR(50) NOT NULL, -- Material Transfer, Material Issue, Material Receipt
    from_warehouse UUID REFERENCES public.warehouses(id),
    to_warehouse UUID REFERENCES public.warehouses(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Cancelled
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stock_entry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.stock_entries(id) ON DELETE CASCADE,
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    qty DECIMAL(15, 2) NOT NULL,
    transfer_qty DECIMAL(15, 2) NOT NULL,
    uom VARCHAR(20),
    basic_rate DECIMAL(15, 2) DEFAULT 0,
    amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUBCONTRACTING LOGIC (Automatic Raw Material Consumption)

CREATE OR REPLACE FUNCTION public.consume_subcontracted_raw_materials(p_receipt_id UUID)
RETURNS VOID AS $$
DECLARE
    r_item RECORD;
    r_raw_mat RECORD;
    v_po_id UUID;
    v_supplier_wh UUID;
    v_bom_id UUID;
    v_receipt_name VARCHAR(100);
BEGIN
    -- Get Receipt and PO details
    SELECT name, purchase_order_id INTO v_receipt_name, v_po_id 
    FROM public.purchase_receipts WHERE id = p_receipt_id;
    
    SELECT supplier_warehouse INTO v_supplier_wh 
    FROM public.purchase_orders WHERE id = v_po_id;

    -- If no supplier warehouse, this isn't a subcontracting flow we can automate yet
    IF v_supplier_wh IS NULL THEN RETURN; END IF;

    -- For each finished good in the receipt
    FOR r_item IN SELECT * FROM public.purchase_receipt_items WHERE parent_id = p_receipt_id LOOP
        -- Find default active BOM for this item
        SELECT id INTO v_bom_id FROM public.bom WHERE item_code = r_item.item_code AND is_active = TRUE AND is_default = TRUE LIMIT 1;
        
        IF v_bom_id IS NOT NULL THEN
            -- Deduct raw materials from supplier warehouse
            FOR r_raw_mat IN SELECT * FROM public.bom_items WHERE parent_id = v_bom_id LOOP
                INSERT INTO public.stock_ledger_entries (
                    item_code, 
                    warehouse_id, 
                    actual_qty, 
                    voucher_type, 
                    voucher_no, 
                    valuation_rate
                )
                VALUES (
                    r_raw_mat.item_code, 
                    v_supplier_wh, 
                    -(r_raw_mat.qty * r_item.qty), -- Consumption
                    'Purchase Receipt', 
                    v_receipt_name, 
                    r_raw_mat.rate
                );
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update submit_purchase_receipt to include raw material consumption
CREATE OR REPLACE FUNCTION public.submit_purchase_receipt(p_id UUID)
RETURNS VOID AS $$
DECLARE
    r_item RECORD;
    v_name VARCHAR(100);
BEGIN
    SELECT name INTO v_name FROM public.purchase_receipts WHERE id = p_id;
    
    -- 1. Increase Stock for Finished/Purchased Items
    FOR r_item IN SELECT * FROM public.purchase_receipt_items WHERE parent_id = p_id LOOP
        INSERT INTO public.stock_ledger_entries (item_code, warehouse_id, actual_qty, voucher_type, voucher_no, valuation_rate)
        VALUES (r_item.item_code, r_item.warehouse_id, r_item.qty, 'Purchase Receipt', v_name, r_item.rate);
    END LOOP;

    -- 2. Handle Subcontracting Raw Material Consumption
    PERFORM public.consume_subcontracted_raw_materials(p_id);

    -- 3. Update status
    UPDATE public.purchase_receipts SET status = 'Completed' WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS ENFORCEMENT
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('bom', 'bom_items', 'stock_entries', 'stock_entry_items')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon all access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow anon all access" ON public.%I FOR ALL USING (true)', t);
    END LOOP;
END $$;
