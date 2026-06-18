import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../db/supabaseClient';
import { isMissingRelationError, warnMissingMigration } from '../db/supabaseErrors';

const PHASE2_MIGRATION = 'supabase/migrations/00011_phase2_transactional_sales.sql';

async function queryTable<T>(
  table: string,
  build: () => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>
): Promise<{ rows: T[]; missing: boolean }> {
  const { data, error } = await build();
  if (error) {
    if (isMissingRelationError(error)) {
      warnMissingMigration(table, PHASE2_MIGRATION);
      return { rows: [], missing: true };
    }
    throw error;
  }
  return { rows: (data ?? []) as T[], missing: false };
}

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
  lead_id: string;
  organization_id: string;
  amount: number;
  probability: number;
  expected_close_date: string;
  stage_id: string;
  owner_id: string;
  notes: string;
  created_at: string;
  crm_pipeline_stages?: CRMPipelineStage;
  crm_organizations?: { organization_name: string };
  leads?: { name: string };
}

export interface CRMPipelineStage {
  id: string;
  name: string;
  order_index: number;
}

export interface CRMActivity {
  id: string;
  deal_id: string;
  lead_id: string;
  type: 'Note' | 'Email' | 'Call' | 'Task';
  content: string;
  created_at: string;
  created_by: string;
  employees?: { first_name: string, last_name: string };
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

export const useCRMLeads = (enabled = true) => {
  return useQuery({
    queryKey: ['crm_leads'],
    enabled,
    retry: false,
    queryFn: () =>
      queryTable<CRMLead>('leads', () =>
        supabase.from('leads').select('*').order('created_at', { ascending: false })
      ),
  });
};

export const useCRMQuotations = (enabled = true) => {
  return useQuery({
    queryKey: ['crm_quotations'],
    enabled,
    retry: false,
    queryFn: () =>
      queryTable<CRMQuotation>('quotations', () =>
        supabase.from('quotations').select('*').order('created_at', { ascending: false })
      ),
  });
};

export const useCRMSalesOrders = (enabled = true) => {
  return useQuery({
    queryKey: ['crm_sales_orders'],
    enabled,
    retry: false,
    queryFn: () =>
      queryTable<CRMSalesOrder>('sales_orders', () =>
        supabase
          .from('sales_orders')
          .select(`
          *,
          crm_organizations:organization_id (organization_name)
        `)
          .order('created_at', { ascending: false })
      ),
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

export const useCRMPipelineStages = () => {
  return useQuery({
    queryKey: ['crm_pipeline_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_pipeline_stages')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as CRMPipelineStage[];
    },
  });
};

export const useCRMDeals = () => {
  return useQuery({
    queryKey: ['crm_deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          crm_pipeline_stages (name),
          crm_organizations (organization_name),
          leads (name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CRMDeal[];
    },
  });
};

export const useCRMDeal = (id: string | null) => {
  return useQuery({
    queryKey: ['crm_deal', id],
    enabled: !!id && id !== 'New',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          crm_pipeline_stages (name),
          crm_organizations (organization_name),
          leads (name)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as CRMDeal;
    },
  });
};

export const useUpdateDealStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string, stageId: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update({ stage_id: stageId })
        .eq('id', dealId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_deals'] });
    },
  });
};

export const useCRMActivities = (dealId?: string, leadId?: string) => {
  return useQuery({
    queryKey: ['crm_activities', dealId, leadId],
    enabled: !!dealId || !!leadId,
    queryFn: async () => {
      let query = supabase
        .from('crm_activities')
        .select(`*, employees (first_name, last_name)`)
        .order('created_at', { ascending: false });
        
      if (dealId) query = query.eq('deal_id', dealId);
      if (leadId) query = query.eq('lead_id', leadId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CRMActivity[];
    },
  });
};

export const useAddCRMActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Partial<CRMActivity>) => {
      const { data, error } = await supabase
        .from('crm_activities')
        .insert(activity)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm_activities'] });
    },
  });
};
