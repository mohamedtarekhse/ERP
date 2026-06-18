import React from 'react';
import { useGlobalStore } from '../../store/globalStore';
import { useCRMDeal } from '../../hooks/useCRM';
import { DealUnifiedView } from './DealUnifiedView';
import { ObjectPage } from '../ObjectPage';

export const CRMDealDetail: React.FC = () => {
  const { activeRecordId, closeObjectPage } = useGlobalStore();
  const isNew = activeRecordId === 'New';
  const { data: deal, isLoading } = useCRMDeal(!isNew ? activeRecordId : null);

  if (activeRecordId && !isNew && isLoading) {
    return <div className="loading-state">Loading Deal...</div>;
  }

  // If it's a new Deal, we would render a form. For now, just show a placeholder or basic ObjectPage.
  if (isNew || !deal) {
    return (
      <ObjectPage 
        title="New Deal"
        subtitle="Pipeline"
        statusBadge={{ text: 'Draft', state: 'Information' }}
        tabs={[{ id: 'info', label: 'Details', component: <div className="p-4">New Deal form not yet implemented.</div> }]}
        onSave={() => closeObjectPage()}
        isNew={true}
      />
    );
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--frappe-bg-light)', zIndex: 50, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', background: 'white' }}>
        <button onClick={closeObjectPage} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--frappe-text-muted)', marginRight: '12px' }}>
          ← Back
        </button>
        <h1 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{deal.name}</h1>
      </div>
      <div style={{ height: 'calc(100% - 45px)' }}>
        <DealUnifiedView deal={deal} />
      </div>
    </div>
  );
};
