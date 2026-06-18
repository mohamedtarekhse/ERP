import React from 'react';
import type { CRMDeal } from '../../hooks/useCRM';

export const DealCard: React.FC<{ deal: CRMDeal; isDragging: boolean }> = ({ deal, isDragging }) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(deal.amount || 0);

  return (
    <div
      style={{
        background: 'white',
        padding: '16px',
        borderRadius: '6px',
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid var(--frappe-border)',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--frappe-text)' }}>
          {deal.name}
        </h4>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--frappe-blue)', background: 'var(--frappe-bg-light)', padding: '2px 6px', borderRadius: '4px' }}>
          {deal.probability}%
        </span>
      </div>
      
      {deal.crm_organizations?.organization_name && (
        <span style={{ fontSize: '13px', color: 'var(--frappe-text-muted)' }}>
          {deal.crm_organizations.organization_name}
        </span>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--frappe-text)' }}>
          {formattedAmount}
        </span>
        {deal.expected_close_date && (
          <span style={{ fontSize: '12px', color: 'var(--frappe-text-muted)' }}>
            {new Date(deal.expected_close_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
};
