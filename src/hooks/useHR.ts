import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../db/supabaseClient';

export interface Employee {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  company_email: string;
  department_id: string;
  designation_id: string;
  status: string;
  branch: string;
  employment_type: string;
  date_of_joining: string;
  departments?: { name: string };
  designations?: { name: string };
}

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          departments:department_id (name),
          designations:designation_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Employee[];
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useDesignations = () => {
  return useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useHRKPIs = () => {
  return useQuery({
    queryKey: ['hr_kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_hr_kpis')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

export const useEmployee = (id: string | null) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          departments:department_id (name),
          designations:designation_id (name),
          employee_skill_map (*),
          employee_internal_work_history (*),
          leave_allocations (*),
          leave_applications (*, leave_types (name))
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Partial<Employee>) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['hr_kpis'] });
    },
  });
};
