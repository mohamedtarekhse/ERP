import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '../../store/globalStore';
import { useCertificate, useRenewCertificate, useAssets } from '../../hooks/useAssets';
import { ObjectPage } from '../ObjectPage';
import { ShieldCheck, Calendar, FileText, User, MapPin, RefreshCw, Download } from 'lucide-react';

export const AssetCertificateDetail: React.FC = () => {
  const { t } = useTranslation();
  const { activeRecordId, closeObjectPage } = useGlobalStore();
  
  const isNew = activeRecordId === 'New Certificate';
  const { data: certificate, isLoading: isCertLoading } = useCertificate(!isNew ? activeRecordId : null);
  const { data: assets } = useAssets();
  const { mutate: renewCert } = useRenewCertificate();

  const [formData, setFormData] = useState<any>({
    equipment_asset_id: '',
    cert_type: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    responsible_employee_id: '',
    remarks: ''
  });

  useEffect(() => {
    if (certificate) {
      setFormData(certificate);
    }
  }, [certificate]);

  const handleRenew = () => {
    if (!certificate) return;
    const newExpiry = new Date();
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    
    renewCert({
      id: certificate.id,
      new_expiry: newExpiry.toISOString().split('T')[0],
      new_issue: new Date().toISOString().split('T')[0]
    }, {
      onSuccess: () => closeObjectPage()
    });
  };

  const handleSave = () => {
    // Implement create/update mutation
    console.log('Save not yet fully implemented');
    closeObjectPage();
  };

  if (activeRecordId && !isNew && isCertLoading) {
    return <div className="loading-state">Loading Certificate...</div>;
  }

  const DetailsTab = (
    <div className="detail-grid">
      <div className="field-group">
        <label>{t('assets.asset_name')}</label>
        <select value={formData.equipment_asset_id} onChange={e => setFormData({...formData, equipment_asset_id: e.target.value})}>
          <option value="">Select Equipment</option>
          {assets?.map((a: any) => <option key={a.id} value={a.id}>{a.asset_name} ({a.asset_tag})</option>)}
        </select>
      </div>
      <div className="field-group">
        <label>{t('assets.cert_type')}</label>
        <input value={formData.cert_type} onChange={e => setFormData({...formData, cert_type: e.target.value})} />
      </div>
      <div className="field-group">
        <label>{t('assets.authority')}</label>
        <input value={formData.issuing_authority} onChange={e => setFormData({...formData, issuing_authority: e.target.value})} />
      </div>
      <div className="field-group">
        <label>Issue Date</label>
        <input type="date" value={formData.issue_date} onChange={e => setFormData({...formData, issue_date: e.target.value})} />
      </div>
      <div className="field-group">
        <label>{t('assets.expiry')}</label>
        <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
      </div>
      <div className="field-group">
        <label>Responsible Engineer</label>
        <input value={certificate?.employees ? `${certificate.employees.first_name} ${certificate.employees.last_name}` : ''} readOnly />
      </div>
    </div>
  );

  const ExpiryTab = (
    <div className="tab-container">
      <h3>Compliance Timeline</h3>
      <div className="compliance-viz">
        <div className="expiry-meter">
          <span className="days-left">{certificate?.days_remaining} Days Remaining</span>
          <div className="progress-bar-wrap large">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${Math.max(0, Math.min(100, (certificate?.days_remaining / 365) * 100))}%`,
                backgroundColor: certificate?.days_remaining < 0 ? 'var(--sap-red)' : certificate?.days_remaining <= 30 ? 'var(--sap-orange)' : 'var(--sap-green)'
              }}
            ></div>
          </div>
        </div>
        
        <div className="action-row" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={handleRenew}>
            <RefreshCw size={16} /> Renew for 1 Year
          </button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--sap-border)', background: 'white', cursor: 'pointer' }}>
            <Download size={16} /> View PDF Attachment
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'details', label: 'Certificate Details', icon: <FileText size={16} />, component: DetailsTab }
  ];

  if (!isNew && certificate) {
    tabs.push({ id: 'expiry', label: 'Expiry & Renewal', icon: <Clock size={16} />, component: ExpiryTab });
  }

  return (
    <ObjectPage 
      title={isNew ? t('assets.new_cert') : certificate?.cert_type}
      subtitle={certificate?.equipment_assets?.asset_name}
      statusBadge={{ 
        text: certificate?.computed_status || 'Draft', 
        state: certificate?.computed_status === 'Valid' ? 'Success' : certificate?.computed_status === 'Expired' ? 'Error' : 'Warning' 
      }}
      tabs={tabs}
      onSave={handleSave}
      isNew={isNew}
    />
  );
};
