-- Migration: 00013_phase4_advanced_hr_payroll
-- Description: Phase 4 - Advanced HR (Recruitment & Component-Based Payroll)

-- 1. RECRUITMENT & LIFECYCLE
CREATE TABLE IF NOT EXISTS public.job_openings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    designation_id UUID REFERENCES public.designations(id),
    department_id UUID REFERENCES public.departments(id),
    status VARCHAR(50) DEFAULT 'Open', -- Open, Closed, On Hold
    scheduled_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_opening_id UUID REFERENCES public.job_openings(id),
    applicant_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Applied', -- Applied, Interview, Rejected, Hired
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id),
    attendance_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Present', -- Present, Absent, Half Day, On Leave
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- 3. COMPONENT-BASED PAYROLL
CREATE TABLE IF NOT EXISTS public.salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., Basic Pay, HRA, Medical, PF
    type VARCHAR(20) NOT NULL, -- Earning, Deduction
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., Junior Engineer Structure
    is_active BOOLEAN DEFAULT TRUE,
    currency VARCHAR(10) DEFAULT 'USD',
    payroll_frequency VARCHAR(20) DEFAULT 'Monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.salary_structure_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.salary_structures(id) ON DELETE CASCADE,
    salary_component_id UUID REFERENCES public.salary_components(id),
    amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.salary_structure_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id),
    salary_structure_id UUID REFERENCES public.salary_structures(id),
    from_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PAYROLL PROCESSING
CREATE TABLE IF NOT EXISTS public.payroll_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., PAY-2026-06
    posting_date DATE DEFAULT CURRENT_DATE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.salary_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., SLIP-EMP001-2026-06
    employee_id UUID REFERENCES public.employees(id),
    payroll_entry_id UUID REFERENCES public.payroll_entries(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    gross_pay DECIMAL(15, 2) DEFAULT 0,
    total_deductions DECIMAL(15, 2) DEFAULT 0,
    net_pay DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Paid, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PAYROLL CALCULATION LOGIC

CREATE OR REPLACE FUNCTION public.process_payroll_entry(p_id UUID)
RETURNS VOID AS $$
DECLARE
    r_emp RECORD;
    r_struct RECORD;
    r_comp RECORD;
    v_slip_id UUID;
    v_gross DECIMAL(15, 2) := 0;
    v_deduct DECIMAL(15, 2) := 0;
    v_start DATE;
    v_end DATE;
    v_entry_name VARCHAR(100);
BEGIN
    SELECT start_date, end_date, name INTO v_start, v_end, v_entry_name FROM public.payroll_entries WHERE id = p_id;

    -- For each active employee with a salary structure assignment
    FOR r_emp IN 
        SELECT e.id, e.employee_id, ssa.salary_structure_id 
        FROM public.employees e
        JOIN public.salary_structure_assignments ssa ON e.id = ssa.employee_id
        WHERE ssa.is_active = TRUE AND e.status = 'Active'
    LOOP
        v_gross := 0;
        v_deduct := 0;

        -- Create Salary Slip
        INSERT INTO public.salary_slips (employee_id, payroll_entry_id, name, start_date, end_date)
        VALUES (r_emp.id, p_id, 'SLIP-' || r_emp.employee_id || '-' || to_char(v_start, 'YYYY-MM'), v_start, v_end)
        RETURNING id INTO v_slip_id;

        -- Calculate from structure
        FOR r_comp IN 
            SELECT sc.type, ssi.amount 
            FROM public.salary_structure_items ssi
            JOIN public.salary_components sc ON ssi.salary_component_id = sc.id
            WHERE ssi.parent_id = r_emp.salary_structure_id
        LOOP
            IF r_comp.type = 'Earning' THEN
                v_gross := v_gross + r_comp.amount;
            ELSE
                v_deduct := v_deduct + r_comp.amount;
            END IF;
        END LOOP;

        -- Update Slip Totals
        UPDATE public.salary_slips 
        SET gross_pay = v_gross,
            total_deductions = v_deduct,
            net_pay = v_gross - v_deduct
        WHERE id = v_slip_id;
    END LOOP;

    -- Update Entry Status
    UPDATE public.payroll_entries SET status = 'Submitted' WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS ENFORCEMENT
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('job_openings', 'job_applicants', 'attendance', 'salary_components', 'salary_structures', 'salary_structure_items', 'salary_structure_assignments', 'payroll_entries', 'salary_slips')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow anon all access" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Allow anon all access" ON public.%I FOR ALL USING (true)', t);
    END LOOP;
END $$;
