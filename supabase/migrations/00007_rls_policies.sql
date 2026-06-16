-- Migration: 00007_rls_policies (Fixed/Idempotent)
-- Description: Enables and enforces Row-Level Security (RLS) based on roles.
-- This version is aligned with the core schema.sql tables.

-- 1. ENABLE RLS ON ALL TABLES
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 2. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS BOOLEAN AS $$
BEGIN
    -- This is a placeholder. In a real system, you would check a user_roles table.
    -- For now, we return true if authenticated for development.
    RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_system_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role('System Manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APPLY POLICIES

-- HR MODULE (employees, leave_requests, timesheets, payroll)
DROP POLICY IF EXISTS "System Managers have full access to employees" ON public.employees;
CREATE POLICY "System Managers have full access to employees" ON public.employees FOR ALL USING (public.is_system_manager());

DROP POLICY IF EXISTS "HR can read all employees" ON public.employees;
CREATE POLICY "HR can read all employees" ON public.employees FOR SELECT USING (public.has_role('HR Manager') OR public.has_role('HR User'));

DROP POLICY IF EXISTS "Users can read own employee record" ON public.employees;
CREATE POLICY "Users can read own employee record" ON public.employees FOR SELECT USING (id = auth.uid() OR email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "HR can manage leave requests" ON public.leave_requests;
CREATE POLICY "HR can manage leave requests" ON public.leave_requests FOR ALL USING (public.has_role('HR Manager'));

DROP POLICY IF EXISTS "Users can manage own leave requests" ON public.leave_requests;
CREATE POLICY "Users can manage own leave requests" ON public.leave_requests FOR ALL USING (employee_id IN (SELECT id FROM public.employees WHERE email = auth.jwt() ->> 'email'));

-- CRM MODULE (accounts, opportunities)
DROP POLICY IF EXISTS "System Managers have full access to accounts" ON public.accounts;
CREATE POLICY "System Managers have full access to accounts" ON public.accounts FOR ALL USING (public.is_system_manager());

DROP POLICY IF EXISTS "Sales can manage accounts" ON public.accounts;
CREATE POLICY "Sales can manage accounts" ON public.accounts FOR ALL USING (public.has_role('Sales User'));

DROP POLICY IF EXISTS "Anyone can read accounts" ON public.accounts;
CREATE POLICY "Anyone can read accounts" ON public.accounts FOR SELECT USING (auth.role() = 'authenticated');

-- ASSET COMPLIANCE (certificates)
DROP POLICY IF EXISTS "Quality managers can manage certs" ON public.certificates;
CREATE POLICY "Quality managers can manage certs" ON public.certificates FOR ALL USING (public.has_role('Quality Manager'));

DROP POLICY IF EXISTS "Anyone can read certs" ON public.certificates;
CREATE POLICY "Anyone can read certs" ON public.certificates FOR SELECT USING (auth.role() = 'authenticated');

-- SUPPLY CHAIN (purchase_orders)
DROP POLICY IF EXISTS "System Managers have full access to POs" ON public.purchase_orders;
CREATE POLICY "System Managers have full access to POs" ON public.purchase_orders FOR ALL USING (public.is_system_manager());

DROP POLICY IF EXISTS "Purchase users can manage POs" ON public.purchase_orders;
CREATE POLICY "Purchase users can manage POs" ON public.purchase_orders FOR ALL USING (public.has_role('Purchase User'));
