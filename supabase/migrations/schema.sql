-- AMICI ERP Database Schema (Supabase PostgreSQL)
-- This script creates the core tables and enables Row-Level Security (RLS)

-- 0. Helper Functions
CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS BOOLEAN AS $$
BEGIN
    -- In Phase 1, we allow all authenticated users.
    -- This will be replaced by a real lookup in a user_roles table in Phase 2.
    RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. HR Module: Employees
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    manager_id UUID REFERENCES public.employees(id),
    salary_band VARCHAR(50),
    cost_center VARCHAR(50),
    crew_type VARCHAR(50), -- e.g., Offshore, Onshore
    rotation_schedule VARCHAR(50), -- e.g., 28/28
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRM Module: Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    account_type VARCHAR(100), -- Operator, JV Partner, Service Co
    country VARCHAR(10),
    owner_id UUID REFERENCES public.employees(id),
    status VARCHAR(50) DEFAULT 'Active',
    annual_revenue DECIMAL(15, 2),
    rating VARCHAR(50), -- Hot, Warm, Cold
    block_reference VARCHAR(100), -- Oil & Gas block ref
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM Module: Opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    stage VARCHAR(50) NOT NULL, -- Prospect, Qualification, Technical Bid, etc.
    close_date DATE,
    owner_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Certificate Compliance Module: Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id VARCHAR(50) UNIQUE NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    asset_tag VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Rotating, Static, Lifting, etc.
    site VARCHAR(100) NOT NULL,
    cert_type VARCHAR(100),
    issuing_authority VARCHAR(255),
    inspector_name VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    responsible_engineer_id UUID REFERENCES public.employees(id),
    status VARCHAR(50) DEFAULT 'Valid',
    remarks TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Supply Chain Module: Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Parts, Chemicals, PPE, etc.
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    po_date DATE NOT NULL,
    expected_delivery DATE,
    status VARCHAR(50) DEFAULT 'Draft',
    destination_site VARCHAR(100),
    raised_by_id UUID REFERENCES public.employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Extended HR Tables

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- Annual, Sick, Unpaid
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    hours_worked DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Approved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    period_month VARCHAR(20) NOT NULL,
    base_salary DECIMAL(15, 2) NOT NULL,
    bonus DECIMAL(15, 2) DEFAULT 0,
    deductions DECIMAL(15, 2) DEFAULT 0,
    net_pay DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Row-Level Security (RLS) Configuration

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- Allow anon access for Phase 1 (Development Mode)
-- These should be removed when moving to a production environment.
CREATE POLICY "Allow anon read access" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access" ON public.employees FOR DELETE USING (true);

CREATE POLICY "Allow anon read access" ON public.accounts FOR SELECT USING (true);
CREATE POLICY "Allow anon insert access" ON public.accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update access" ON public.accounts FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete access" ON public.accounts FOR DELETE USING (true);

CREATE POLICY "Allow anon all access" ON public.opportunities FOR ALL USING (true);
CREATE POLICY "Allow anon all access" ON public.certificates FOR ALL USING (true);
CREATE POLICY "Allow anon all access" ON public.purchase_orders FOR ALL USING (true);
CREATE POLICY "Allow anon all access" ON public.leave_requests FOR ALL USING (true);
CREATE POLICY "Allow anon all access" ON public.timesheets FOR ALL USING (true);
CREATE POLICY "Allow anon all access" ON public.payroll FOR ALL USING (true);

-- Create basic policies for authenticated users
CREATE POLICY "Allow authenticated read access" ON public.employees FOR SELECT USING (public.has_role('User'));
CREATE POLICY "Allow authenticated insert access" ON public.employees FOR INSERT WITH CHECK (public.has_role('User'));
CREATE POLICY "Allow authenticated update access" ON public.employees FOR UPDATE USING (public.has_role('User'));

CREATE POLICY "Allow authenticated read access" ON public.accounts FOR SELECT USING (public.has_role('User'));
CREATE POLICY "Allow authenticated read access" ON public.opportunities FOR SELECT USING (public.has_role('User'));
CREATE POLICY "Allow authenticated read access" ON public.certificates FOR SELECT USING (public.has_role('User'));
CREATE POLICY "Allow authenticated read access" ON public.purchase_orders FOR SELECT USING (public.has_role('User'));
