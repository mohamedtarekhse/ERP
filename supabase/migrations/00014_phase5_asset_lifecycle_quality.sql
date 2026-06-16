-- Migration: 00014_phase5_asset_lifecycle_quality
-- Description: Phase 5 - Asset Lifecycle (Movements & Maintenance) and Quality Compliance

-- 1. ASSET EXTENSIONS
CREATE TABLE IF NOT EXISTS public.asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., Vehicles, IT Equipment, Heavy Machinery
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.asset_categories (name) VALUES ('Vehicles'), ('IT Equipment'), ('Heavy Machinery'), ('Tools'), ('Safety Equipment') ON CONFLICT DO NOTHING;

ALTER TABLE public.equipment_assets ADD COLUMN IF NOT EXISTS asset_category_id UUID REFERENCES public.asset_categories(id);
ALTER TABLE public.equipment_assets ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE public.equipment_assets ADD COLUMN IF NOT EXISTS gross_purchase_amount DECIMAL(15, 2);

-- 2. ASSET MOVEMENTS (Location & Custody tracking)
CREATE TABLE IF NOT EXISTS public.asset_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.equipment_assets(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    from_employee_id UUID REFERENCES public.employees(id),
    to_employee_id UUID REFERENCES public.employees(id),
    from_warehouse_id UUID REFERENCES public.warehouses(id),
    to_warehouse_id UUID REFERENCES public.warehouses(id),
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ASSET MAINTENANCE
CREATE TABLE IF NOT EXISTS public.asset_maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.equipment_assets(id),
    maintenance_type VARCHAR(100) NOT NULL, -- e.g., Monthly Inspection, Annual Service
    periodicity VARCHAR(50), -- Daily, Weekly, Monthly, Yearly
    start_date DATE NOT NULL,
    last_completion_date DATE,
    next_due_date DATE NOT NULL,
    assigned_to_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.equipment_assets(id),
    maintenance_schedule_id UUID REFERENCES public.asset_maintenance_schedules(id),
    completion_date DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    cost DECIMAL(15, 2) DEFAULT 0,
    performed_by UUID REFERENCES public.employees(id),
    certificate_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. QUALITY COMPLIANCE
CREATE TABLE IF NOT EXISTS public.quality_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_type VARCHAR(50) NOT NULL, -- Incoming, In-Process, Outgoing
    reference_type VARCHAR(50), -- Purchase Receipt, Delivery Note, Stock Entry
    reference_name VARCHAR(100), -- ID of the reference document
    item_code VARCHAR(100) REFERENCES public.items(item_code),
    sample_size DECIMAL(15, 2) DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Accepted, Rejected
    inspected_by UUID REFERENCES public.employees(id),
    inspection_date DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMPLIANCE WORKFLOW (Link Maintenance to Certificate Renewal)

CREATE OR REPLACE FUNCTION public.complete_maintenance_log(p_log_id UUID, p_new_expiry DATE)
RETURNS VOID AS $$
DECLARE
    v_asset_id UUID;
    v_cert_id UUID;
BEGIN
    -- 1. Get asset from log
    SELECT asset_id INTO v_asset_id FROM public.asset_maintenance_logs WHERE id = p_log_id;

    -- 2. Find associated certificate (if exists)
    SELECT id INTO v_cert_id FROM public.certificates WHERE equipment_asset_id = v_asset_id LIMIT 1;

    -- 3. If certificate exists, renew it
    IF v_cert_id IS NOT NULL THEN
        UPDATE public.certificates 
        SET expiry_date = p_new_expiry,
            issue_date = CURRENT_DATE,
            status = 'Valid'
        WHERE id = v_cert_id;
        
        UPDATE public.asset_maintenance_logs SET certificate_generated = TRUE WHERE id = p_log_id;
    END IF;

    -- 4. Update next due date on schedule
    UPDATE public.asset_maintenance_schedules 
    SET last_completion_date = CURRENT_DATE,
        next_due_date = p_new_expiry -- Assuming expiry matches next due date
    WHERE id = (SELECT maintenance_schedule_id FROM public.asset_maintenance_logs WHERE id = p_log_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS ENFORCEMENT
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('asset_categories', 'asset_movements', 'asset_maintenance_schedules', 'asset_maintenance_logs', 'quality_inspections')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon all access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow anon all access" ON public.%I FOR ALL USING (true)', t);
    END LOOP;
END $$;
