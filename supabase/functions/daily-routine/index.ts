import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    console.log('Starting daily routine check...');

    // 1. Recompute Certificate Statuses
    // Based on expiry_date vs now()
    // valid: > 90 days, renewal: 31-90 days, expiring: 0-30 days, expired: < 0 days
    const { data: certs, error: certError } = await supabase
      .from('equipment_certificates')
      .select('id, expiry_date, workflow_state');

    if (certError) throw certError;

    const updates = certs.map(cert => {
      const daysLeft = Math.floor((new Date(cert.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      let newState = 'Valid';
      if (daysLeft < 0) newState = 'Expired';
      else if (daysLeft <= 30) newState = 'Expiring';
      else if (daysLeft <= 90) newState = 'Renewal';

      if (newState !== cert.workflow_state) {
        return { id: cert.id, workflow_state: newState };
      }
      return null;
    }).filter(Boolean);

    if (updates.length > 0) {
      await supabase.from('equipment_certificates').upsert(updates);
      console.log(`Updated ${updates.length} certificate statuses.`);
    }

    // 2. Generate Notifications for Expiring/Expired Certs
    const expiringCerts = updates.filter(u => u!.workflow_state === 'Expiring' || u!.workflow_state === 'Expired');
    if (expiringCerts.length > 0) {
      const notifs = expiringCerts.map(u => ({
        role_id: null, // Broadcast to Quality Manager role if we had its ID, or keep null for system-wide
        document_type: 'Certificate',
        document_id: u!.id,
        subject: `Certificate ${u!.workflow_state}: Requires action`,
        type: 'Alert'
      }));
      // In a real app, we'd fetch the Quality Manager role ID first
      await supabase.from('notification_log').insert(notifs);
    }

    return new Response(JSON.stringify({ success: true, updatedCerts: updates.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
