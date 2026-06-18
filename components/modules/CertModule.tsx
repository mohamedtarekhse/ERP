import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCertificates, useAssetKPIs } from '../../hooks/useAssets';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { FileStack } from 'lucide-react';

const KPICard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="kpi-card">
    <span className="kpi-label">{title}</span>
    <span className="kpi-value">{value}</span>
  </div>
);

export const AssetModule: React.FC = () => {
  const { t } = useTranslation();
  const { openObjectPage } = useGlobalStore();
  const { data: certificates, isLoading: certsLoading } = useCertificates();
  const { data: kpis, isLoading: kpisLoading } = useAssetKPIs();

  const columns = [
    { 
      key: 'equipment_assets', 
      label: t('assets.asset_name') || 'Equipment',
      render: (row: any) => row.equipment_assets?.asset_name || '-'
    },
    { 
      key: 'asset_tag', 
      label: t('assets.asset_tag') || 'Tag',
      render: (row: any) => row.equipment_assets?.asset_tag || '-'
    },
    { key: 'cert_type', label: t('assets.cert_type') || 'Type' },
    { key: 'expiry_date', label: t('assets.expiry') || 'Expiry' },
    { 
      key: 'days_remaining', 
      label: t('assets.days') || 'Days',
      render: (row: any) => {
        const days = row.days_remaining;
        const colorClass = days < 0 ? 'pill-red' : days <= 30 ? 'pill-orange' : 'pill-green';
        return <span className={`pill ${colorClass}`}>{days < 0 ? `Expired ${Math.abs(days)}d` : `${days}d`}</span>;
      }
    },
    { 
      key: 'computed_status', 
      label: t('assets.status') || 'Status',
      render: (row: any) => (
        <span className={`pill pill-${row.computed_status === 'Valid' ? 'green' : row.computed_status === 'Expired' ? 'red' : 'orange'}`}>
          {row.computed_status}
        </span>
      )
    }
  ];

  if (certsLoading || kpisLoading) {
    return <div className="loading-state">Loading Asset Workspace...</div>;
  }

  return (
    <div className="workspace-container">
      <header className="workspace-header">
        <h1 className="workspace-title">{t('nav.assets')}</h1>
      </header>

      {/* KPI Row - Frappe style cards */}
      <div className="kpi-grid">
        <KPICard title="Total Certificates" value={kpis?.total_certs || 0} />
        <KPICard title="Compliance Rate" value={`${kpis?.compliance_rate || 0}%`} />
        <KPICard title="Expiring (30d)" value={kpis?.expiring_count || 0} />
        <KPICard title="Expired" value={kpis?.expired_count || 0} />
      </div>

      {/* Main Content - Workspace Section */}
      <div className="section-card">
        <div className="section-header">
          <span>{t('assets.equipment_certs') || 'Asset Master & Compliance'}</span>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('Certificate', 'New')}>
              <FileStack size={14} style={{ marginRight: '6px' }} />
              {t('assets.new_cert') || 'Add Certificate'}
            </button>
          </div>
        </div>
        
        <div className="section-body" style={{ padding: 0 }}>
          <DataTable 
            columns={columns} 
            data={certificates || []} 
            onRowClick={(row) => openObjectPage('Certificate', row.id)}
          />
        </div>
      </div>
    </div>
  );
};
