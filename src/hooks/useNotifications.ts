import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../db/supabaseClient';
import { useEffect } from 'react';

export interface Notification {
  id: string;
  subject: string;
  document_type: string;
  document_id: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch unread notifications
  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notification_log')
        .select('*')
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });

  // Listen for real-time changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_log',
          filter: `user_id=eq.${userId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_log')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
