import React, { useState } from 'react';
import { useCRMActivities, useAddCRMActivity } from '../../hooks/useCRM';
import type { CRMDeal } from '../../hooks/useCRM';
import { FileText, Mail, Phone, CheckSquare } from 'lucide-react';

export const DealUnifiedView: React.FC<{ deal: CRMDeal }> = ({ deal }) => {
  const { data: activities, isLoading } = useCRMActivities(deal.id);
  const addActivity = useAddCRMActivity();
  const [newActivityContent, setNewActivityContent] = useState('');
  const [activeTab, setActiveTab] = useState<'Note' | 'Email' | 'Call' | 'Task'>('Note');

  const handleAddActivity = () => {
    if (!newActivityContent.trim()) return;
    
    addActivity.mutate({
      deal_id: deal.id,
      lead_id: deal.lead_id,
      type: activeTab,
      content: newActivityContent
    }, {
      onSuccess: () => setNewActivityContent('')
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Email': return <Mail size={16} />;
      case 'Call': return <Phone size={16} />;
      case 'Task': return <CheckSquare size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '20px', height: '100%' }}>
      {/* Left Column: Deal Details */}
      <div style={{ flex: '1', background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--frappe-border)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>{deal.name}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--frappe-text-muted)' }}>Amount</label>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.amount || 0)}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--frappe-text-muted)' }}>Probability</label>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--frappe-blue)' }}>{deal.probability}%</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--frappe-text-muted)' }}>Organization</label>
            <div style={{ fontSize: '14px' }}>{deal.crm_organizations?.organization_name || '-'}</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--frappe-text-muted)' }}>Expected Close</label>
            <div style={{ fontSize: '14px' }}>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}</div>
          </div>
        </div>

        {deal.notes && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--frappe-text-muted)', marginBottom: '4px' }}>Notes</label>
            <div style={{ fontSize: '14px', background: 'var(--frappe-bg-light)', padding: '12px', borderRadius: '6px' }}>
              {deal.notes}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Activity Timeline */}
      <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Activity Composer */}
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--frappe-border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--frappe-border)', background: 'var(--frappe-bg-light)' }}>
            {(['Note', 'Email', 'Call', 'Task'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--frappe-blue)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--frappe-blue)' : 'var(--frappe-text-muted)',
                  fontWeight: activeTab === tab ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {getIcon(tab)} {tab}
              </button>
            ))}
          </div>
          <div style={{ padding: '16px' }}>
            <textarea
              value={newActivityContent}
              onChange={(e) => setNewActivityContent(e.target.value)}
              placeholder={`Write a ${activeTab.toLowerCase()}...`}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                border: '1px solid var(--frappe-border)',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-frappe btn-frappe-primary" 
                onClick={handleAddActivity}
                disabled={!newActivityContent.trim() || addActivity.isPending}
              >
                {addActivity.isPending ? 'Saving...' : `Add ${activeTab}`}
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--frappe-border)', padding: '20px', flexGrow: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Activity Timeline</h3>
          
          {isLoading ? (
            <div className="loading-state">Loading timeline...</div>
          ) : activities?.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--frappe-text-muted)', padding: '24px 0' }}>No activities yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities?.map(activity => (
                <div key={activity.id} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'var(--frappe-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--frappe-text-muted)', flexShrink: 0
                  }}>
                    {getIcon(activity.type)}
                  </div>
                  <div style={{ flexGrow: 1, border: '1px solid var(--frappe-border)', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        {activity.type} by {activity.employees ? `${activity.employees.first_name} ${activity.employees.last_name}` : 'System'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--frappe-text-muted)' }}>
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--frappe-text)', whiteSpace: 'pre-wrap' }}>
                      {activity.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
