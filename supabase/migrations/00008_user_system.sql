-- Secure User & Role Management System
-- This script sets up a profile and role-based access control (RBAC) system.
-- Note: Supabase Auth manages the 'auth.users' table and password hashing internally.
-- This script creates the 'public' side of that data.

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial roles
INSERT INTO public.roles (name, description) VALUES
('System Manager', 'Full system access'),
('HR Manager', 'Manage all HR records and payroll'),
('HR User', 'Read HR records and manage own leave'),
('Sales User', 'Manage CRM accounts and opportunities'),
('Purchase User', 'Manage purchase orders and inventory'),
('Quality Manager', 'Manage asset compliance and certificates'),
('User', 'Basic access to own records')
ON CONFLICT (name) DO NOTHING;

-- 2. Create User Roles (Join Table)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 3. Create Profiles Table (Public user data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Automatically create profile and assign 'User' role on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Get the ID for the 'User' role
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'User';

    -- Create profile
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

    -- Assign default role
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new.id, default_role_id);

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper Function to check roles in RLS
CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Basic Policies
CREATE POLICY "Public roles are viewable by everyone" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System Managers can manage all roles" ON public.user_roles FOR ALL USING (public.has_role('System Manager'));
