import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '../../store/globalStore';
import { useCRMOrganization, useCreateOrganization } from '../../hooks/useCRM';
import { useEmployees } from '../../hooks/useHR';
import { ObjectPage } from '../ObjectPage';
import { Building2, Mail, Phone, Globe, Calendar, DollarSign, Target, ListChecks } from 'lucide-react';

export const CRMAccountDetail: React.FC = () => {
  const { t } = useTranslation();
  const { activeRecordId, closeObjectPage } = useGlobalStore();
  
  const isNew = activeRecordId === 'New Account';
  const { data: organization, isLoading: isOrgLoading } = useCRMOrganization(!isNew ? activeRecordId : null);
  const { data: employees } = useEmployees();
  const { mutate: createOrg } = useCreateOrganization();

  const [formData, setFormData] = useState<any>({
    organization_name: '',
    industry: 'Energy',
    website: '',
    rating: 'Warm',
    annual_revenue: 0,
    territory: '',
    account_owner: '',
    block_ref: ''
  });

  useEffect(() => {
    if (organization) {
      setFormData(organization);
    }
  }, [organization]);

  const handleSave = () => {
    if (isNew) {
      createOrg(formData, {
        onSuccess: () => closeObjectPage()
      });
    } else {
      console.log('Update not yet implemented');
      closeObjectPage();
    }
  };

  if (activeRecordId && !isNew && isOrgLoading) {
    return <div className="loading-state">Loading Account...</div>;
  }

  const InfoTab = (
    <div className="detail-grid">
      <div className="field-group">
        <label>{t('crm.org_name')}</label>
        <input value={formData.organization_name} onChange={e => setFormData({...formData, organization_name: e.target.value})} />
      </div>
      <div className="field-group">
        <label>{t('crm.industry')}</label>
        <input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
      </div>
      <div className="field-group">
        <label>{t('crm.rating')}</label>
        <select value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
        </select>
      </div>
      <div className="field-group">
        <label>{t('crm.revenue')} (USD)</label>
        <input type="number" value={formData.annual_revenue} onChange={e => setFormData({...formData, annual_revenue: Number(e.target.value)})} />
      </div>
      <div className="field-group">
        <label>{t('crm.owner')}</label>
        <select value={formData.account_owner} onChange={e => setFormData({...formData, account_owner: e.target.value})}>
          <option value="">Select Owner</option>
          {employees?.map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
        </select>
      </div>
      <div className="field-group">
        <label>Website</label>
        <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
      </div>
      <div className="field-group">
        <label>Territory</label>
        <input value={formData.territory} onChange={e => setFormData({...formData, territory: e.target.value})} />
      </div>
      <div className="field-group">
        <label>Block / Concession Ref</label>
        <input value={formData.block_ref} onChange={e => setFormData({...formData, block_ref: e.target.value})} />
      </div>
    </div>
  );

  const DealsTab = (
    <div className="tab-container">
      <h3>Active Opportunities</h3>
      <div className="deal-list">
        {organization?.crm_deals?.map((deal: any) => (
          <div key={deal.id} className="deal-card">
            <div className="deal-header">
              <span className="deal-title">{deal.title}</span>
              <span className="deal-value">{new Intl.NumberFormat('en-US', { style: 'currency', currency: deal.currency }).format(deal.value)}</span>
            </div>
            <div className="pipeline-wrap">
              <div className="pipeline-label">Stage: {deal.status} ({deal.probability}%)</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: `${deal.probability}%`, backgroundColor: 'var(--sap-green)' }}></div>
              </div>
            </div>
          </div>
        ))}
        {!organization?.crm_deals?.length && <p>No active opportunities found.</p>}
      </div>
    </div>
  );

  const ActivitiesTab = (
    <div className="timeline">
      {organization?.crm_activities?.sort((a: any, b: any) => new Date(b.reference_date).getTime() - new Date(a.reference_date).getTime()).map((act: any) => (
        <div key={act.id} className="timeline-item">
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <div className="timeline-date">{new Date(act.reference_date).toLocaleString()}</div>
            <div className="timeline-title">{act.activity_type}</div>
            <div className="timeline-desc">{act.content}</div>
          </div>
        </div>
      ))}
      {!organization?.crm_activities?.length && <p>No activities logged.</p>}
    </div>
  );

  const tabs = [
    { id: 'info', label: 'Account Info', icon: <Building2 size={16} />, component: InfoTab }
  ];

  if (!isNew && organization) {
    tabs.push({ id: 'deals', label: 'Pipeline', icon: <Target size={16} />, component: DealsTab });
    tabs.push({ id: 'activities', label: 'Timeline', icon: <ListChecks size={16} />, component: ActivitiesTab });
  }

  return (
    <ObjectPage 
      title={isNew ? t('crm.new_account') : formData.organization_name}
      subtitle={formData.industry}
      statusBadge={{ 
        text: formData.rating, 
        state: formData.rating === 'Hot' ? 'Error' : formData.rating === 'Warm' ? 'Warning' : 'Information' 
      }}
      tabs={tabs}
      onSave={handleSave}
      isNew={isNew}
    />
  );
};
