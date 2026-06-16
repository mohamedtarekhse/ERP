import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCertificates, useAssetKPIs } from '../../hooks/useAssets';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { ShieldCheck, CheckCircle2, Clock, AlertCircle, FileStack } from 'lucide-react';

const KPICard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
  <div className="kpi-card">
    <div className="kpi-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="kpi-content">
      <span className="kpi-title">{title}</span>
      <span className="kpi-value">{value}</span>
    </div>
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
        const color = days < 0 ? 'var(--sap-red)' : days <= 30 ? 'var(--sap-orange)' : 'var(--sap-green)';
        return <span style={{ color, fontWeight: 600 }}>{days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d`}</span>;
      }
    },
    { 
      key: 'computed_status', 
      label: t('assets.status') || 'Status',
      render: (row: any) => (
        <span className={`status-pill status-${row.computed_status?.toLowerCase()}`}>
          {row.computed_status}
        </span>
      )
    }
  ];

  if (certsLoading || kpisLoading) {
    return <div className="loading-state">Loading Compliance Data...</div>;
  }

  return (
    <div className="module-container">
      {/* KPI Row */}
      <div className="kpi-row">
        <KPICard 
          title="Total Certificates" 
          value={kpis?.total_certs || 0} 
          icon={<FileStack size={24} />} 
          color="var(--sap-blue)" 
        />
        <KPICard 
          title="Compliance Rate" 
          value={`${kpis?.compliance_rate || 0}%`} 
          icon={<ShieldCheck size={24} />} 
          color="var(--sap-green)" 
        />
        <KPICard 
          title="Expiring (30d)" 
          value={kpis?.expiring_count || 0} 
          icon={<Clock size={24} />} 
          color="var(--sap-orange)" 
        />
        <KPICard 
          title="Expired" 
          value={kpis?.expired_count || 0} 
          icon={<AlertCircle size={24} />} 
          color="var(--sap-red)" 
        />
      </div>

      <div className="module-content">
        <div className="content-header">
          <h2>Equipment Certificates ({certificates?.length || 0})</h2>
          <button className="btn-primary" onClick={() => openObjectPage('New Certificate')}>
            <FileStack size={16} />
            <span>{t('assets.new_cert') || 'New Certificate'}</span>
          </button>
        </div>
        
        <DataTable 
          title="Certificates"
          columns={columns} 
          data={certificates || []} 
          onRowClick={(row) => openObjectPage(row.id)}
        />
      </div>
    </div>
  );
};
