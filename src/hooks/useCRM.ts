import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../db/supabaseClient';

export interface CRMOrganization {
  id: string;
  name: string;
  organization_name: string;
  industry: string;
  website: string;
  territory: string;
  rating: string;
  annual_revenue: number;
  block_ref: string;
  account_owner: string;
  employees?: { first_name: string, last_name: string };
}

export interface CRMDeal {
  id: string;
  name: string;
  title: string;
  value: number;
  currency: string;
  status: string;
  probability: number;
  close_date: string;
}

export interface CRMActivity {
  id: string;
  activity_type: string;
  reference_date: string;
  content: string;
}

export interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
}

export interface CRMQuotation {
  id: string;
  name: string;
  organization_id: string;
  lead_id: string;
  transaction_date: string;
  status: string;
  grand_total: number;
}

export interface CRMSalesOrder {
  id: string;
  name: string;
  organization_id: string;
  transaction_date: string;
  delivery_date: string;
  workflow_state: string;
  grand_total: number;
}

export const useCRMLeads = () => {
  return useQuery({
    queryKey: ['crm_leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CRMLead[];
    },
  });
};

export const useCRMQuotations = () => {
  return useQuery({
    queryKey: ['crm_quotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CRMQuotation[];
    },
  });
};

export const useCRMSalesOrders = () => {
  return useQuery({
    queryKey: ['crm_sales_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          crm_organizations:organization_id (organization_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CRMSalesOrder[];
    },
  });
};

export const useCRMOrganizations = () => {
  return useQuery({
    queryKey: ['crm_organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_organizations')
        .select(`
          *,
          employees:account_owner (first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CRMOrganization[];
    },
  });
};

export const useCRMOrganization = (id: string | null) => {
  return useQuery({
    queryKey: ['crm_organization', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('crm_organizations')
        .select(`
          *,
          employees:account_owner (*),
          contacts (*),
          crm_deals (*),
          crm_activities (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCRMKPIs = () => {
  return useQuery({
    queryKey: ['crm_kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_crm_kpis')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (org: Partial<CRMOrganization>) => {
      const { data, error } = await supabase
        .from('crm_organizations')
        .insert(org)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_organizations'] });
      queryClient.invalidateQueries({ queryKey: ['crm_kpis'] });
    },
  });
};
