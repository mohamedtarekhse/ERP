import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../db/supabaseClient';

export interface EquipmentCertificate {
  id: string;
  name: string;
  equipment_asset_id: string;
  cert_type: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  workflow_state: string;
  days_remaining: number;
  computed_status: string;
  equipment_assets?: { asset_name: string, asset_tag: string, category: string };
}

export interface EquipmentAsset {
  id: string;
  name: string;
  asset_name: string;
  asset_tag: string;
  category: string;
  warehouse_id: string;
}

export const useCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_certs_with_status')
        .select(`
          *,
          equipment_assets:equipment_asset_id (asset_name, asset_tag, category)
        `)
        .order('expiry_date', { ascending: true });
      
      if (error) throw error;
      return data as EquipmentCertificate[];
    },
  });
};

export const useCertificate = (id: string | null) => {
  return useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('v_certs_with_status')
        .select(`
          *,
          equipment_assets:equipment_asset_id (*),
          employees:responsible_employee_id (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useAssetKPIs = () => {
  return useQuery({
    queryKey: ['asset_kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_cert_kpis')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAssets = () => {
  return useQuery({
    queryKey: ['equipment_assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_assets')
        .select('*')
        .order('asset_name');
      
      if (error) throw error;
      return data as EquipmentAsset[];
    },
  });
};

export const useRenewCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, new_expiry, new_issue }: { id: string, new_expiry: string, new_issue: string }) => {
      const { data, error } = await supabase.rpc('renew_certificate', {
        p_id: id,
        p_new_expiry: new_expiry,
        p_new_issue: new_issue
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['asset_kpis'] });
    },
  });
};
