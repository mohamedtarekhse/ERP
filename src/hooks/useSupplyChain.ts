import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../db/supabaseClient';

export interface PurchaseOrder {
  id: string;
  name: string;
  supplier_id: string;
  transaction_date: string;
  schedule_date: string;
  currency: string;
  workflow_state: string;
  priority: string;
  grand_total: number;
  suppliers?: { supplier_name: string };
}

export interface InventoryBin {
  id: string;
  item_code: string;
  warehouse_id: string;
  actual_qty: number;
  item_name: string;
  stock_status: string;
  reorder_level: number;
}

export interface MaterialRequest {
  id: string;
  name: string;
  transaction_date: string;
  schedule_date: string;
  type: string;
  status: string;
  requested_by: string;
}

export interface PurchaseReceipt {
  id: string;
  name: string;
  supplier_id: string;
  purchase_order_id: string;
  transaction_date: string;
  status: string;
  grand_total: number;
}

export const useMaterialRequests = () => {
  return useQuery({
    queryKey: ['material_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MaterialRequest[];
    },
  });
};

export const usePurchaseReceipts = () => {
  return useQuery({
    queryKey: ['purchase_receipts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_receipts')
        .select(`
          *,
          suppliers:supplier_id (supplier_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PurchaseReceipt[];
    },
  });
};

export const useSubmitReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('submit_purchase_receipt', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_receipts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchase_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers:supplier_id (supplier_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PurchaseOrder[];
    },
  });
};

export const usePurchaseOrder = (id: string | null) => {
  return useQuery({
    queryKey: ['purchase_order', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers:supplier_id (*),
          purchase_order_items (*),
          warehouses:set_warehouse (*),
          employees:requested_by (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useInventory = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_bins_with_status')
        .select('*')
        .order('actual_qty', { ascending: true });
      
      if (error) throw error;
      return data as InventoryBin[];
    },
  });
};

export const useSCKPIs = () => {
  return useQuery({
    queryKey: ['sc_kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_sc_kpis')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSCDashboardCharts = () => {
  return useQuery({
    queryKey: ['sc_charts'],
    queryFn: async () => {
      // Fetch spend by category
      const { data: spendData } = await supabase
        .from('purchase_orders')
        .select('purchase_order_items(amount), items(item_groups(name))')
        .neq('workflow_state', 'Cancelled');

      // Fetch status breakdown
      const { data: statusData } = await supabase
        .from('purchase_orders')
        .select('workflow_state');

      return { spendData, statusData };
    },
  });
};

export const useSubmitPO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('submit_purchase_order', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
    },
  });
};

export const useApprovePO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('approve_purchase_order', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
    },
  });
};

export const useReceivePO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('mark_po_received', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
