import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCRMOrganizations, useCRMKPIs } from '../../hooks/useCRM';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { Building2, Landmark, Target, Award, Clock } from 'lucide-react';

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

export const CRMModule: React.FC = () => {
  const { t } = useTranslation();
  const { openObjectPage } = useGlobalStore();
  const { data: organizations, isLoading: orgsLoading } = useCRMOrganizations();
  const { data: kpis, isLoading: kpisLoading } = useCRMKPIs();

  const columns = [
    { key: 'name', label: t('hr.employee_id') || 'ID' },
    { key: 'organization_name', label: t('crm.org_name') || 'Organization' },
    { key: 'industry', label: t('crm.industry') || 'Industry' },
    { 
      key: 'rating', 
      label: t('crm.rating') || 'Rating',
      render: (row: any) => (
        <span className={`rating-indicator rating-${row.rating?.toLowerCase()}`}>
          {row.rating === 'Hot' ? '🔴' : row.rating === 'Warm' ? '🟡' : '🔵'} {row.rating}
        </span>
      )
    },
    { 
      key: 'owner', 
      label: t('crm.owner') || 'Owner',
      render: (row: any) => row.employees ? `${row.employees.first_name} ${row.employees.last_name}` : '-'
    },
    { 
      key: 'annual_revenue', 
      label: t('crm.revenue') || 'Revenue',
      render: (row: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.annual_revenue || 0)
    }
  ];

  if (orgsLoading || kpisLoading) {
    return <div className="loading-state">Loading CRM Module...</div>;
  }

  return (
    <div className="module-container">
      {/* KPI Row */}
      <div className="kpi-row">
        <KPICard 
          title="Total Accounts" 
          value={kpis?.total_organizations || 0} 
          icon={<Building2 size={24} />} 
          color="var(--sap-blue)" 
        />
        <KPICard 
          title="Active Contract Value" 
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpis?.active_contract_value || 0)} 
          icon={<Landmark size={24} />} 
          color="var(--sap-green)" 
        />
        <KPICard 
          title="Win Rate" 
          value={`${kpis?.win_rate || 0}%`} 
          icon={<Award size={24} />} 
          color="var(--sap-purple)" 
        />
        <KPICard 
          title="Overdue Tasks" 
          value={kpis?.overdue_activities || 0} 
          icon={<Clock size={24} />} 
          color="var(--sap-red)" 
        />
      </div>

      {/* Main Content: Master-Detail */}
      <div className="module-content">
        <div className="content-header">
          <h2>Accounts ({organizations?.length || 0})</h2>
          <button className="btn-primary" onClick={() => openObjectPage('New Account')}>
            <Target size={16} />
            <span>{t('crm.new_account') || 'New Account'}</span>
          </button>
        </div>
        
        <DataTable 
          title="Accounts"
          columns={columns} 
          data={organizations || []} 
          onRowClick={(row) => openObjectPage(row.id)}
        />
      </div>
    </div>
  );
};
