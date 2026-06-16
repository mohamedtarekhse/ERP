import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCRMOrganizations, useCRMKPIs, useCRMLeads, useCRMQuotations, useCRMSalesOrders } from '../../hooks/useCRM';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { Building2, Landmark, Target, Award, Clock, UserPlus, FileText, ShoppingCart } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'leads' | 'accounts' | 'quotations' | 'orders'>('accounts');
  
  const { data: organizations, isLoading: orgsLoading } = useCRMOrganizations();
  const { data: leads, isLoading: leadsLoading } = useCRMLeads();
  const { data: quotations, isLoading: qtsLoading } = useCRMQuotations();
  const { data: orders, isLoading: ordersLoading } = useCRMSalesOrders();
  const { data: kpis, isLoading: kpisLoading } = useCRMKPIs();

  const leadColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'source', label: 'Source' },
    { 
      key: 'status', 
      label: 'Status',
      render: (row: any) => (
        <span className={`status-pill status-${row.status?.toLowerCase()}`}>
          {row.status}
        </span>
      )
    }
  ];

  const orgColumns = [
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

  const qtColumns = [
    { key: 'name', label: 'ID' },
    { key: 'transaction_date', label: 'Date' },
    { 
      key: 'status', 
      label: 'Status',
      render: (row: any) => (
        <span className={`status-pill status-${row.status?.toLowerCase()}`}>
          {row.status}
        </span>
      )
    },
    { 
      key: 'grand_total', 
      label: 'Total',
      render: (row: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.grand_total || 0)
    }
  ];

  const orderColumns = [
    { key: 'name', label: 'SO Number' },
    { 
      key: 'customer', 
      label: 'Customer',
      render: (row: any) => row.crm_organizations?.organization_name || '-'
    },
    { key: 'delivery_date', label: 'Expected Delivery' },
    { 
      key: 'workflow_state', 
      label: 'Status',
      render: (row: any) => (
        <span className={`status-pill status-${row.workflow_state?.toLowerCase().replace(' ', '-')}`}>
          {row.workflow_state}
        </span>
      )
    },
    { 
      key: 'grand_total', 
      label: 'Total',
      render: (row: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.grand_total || 0)
    }
  ];

  if (orgsLoading || kpisLoading || leadsLoading || qtsLoading || ordersLoading) {
    return <div className="loading-state">Loading CRM & Sales Module...</div>;
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

      <div className="module-content">
        <div className="tab-navigation" style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--sap-border)', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('leads')} style={activeTab === 'leads' ? styles.activeTab : styles.tab}>Leads</button>
          <button onClick={() => setActiveTab('accounts')} style={activeTab === 'accounts' ? styles.activeTab : styles.tab}>Accounts</button>
          <button onClick={() => setActiveTab('quotations')} style={activeTab === 'quotations' ? styles.activeTab : styles.tab}>Quotations</button>
          <button onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? styles.activeTab : styles.tab}>Sales Orders</button>
        </div>

        {activeTab === 'leads' && (
          <>
            <div className="content-header">
              <h2>Recent Leads</h2>
              <button className="btn-primary" onClick={() => openObjectPage('Lead', 'New Lead')}>
                <UserPlus size={16} />
                <span>New Lead</span>
              </button>
            </div>
            <DataTable title="Leads" columns={leadColumns} data={leads || []} onRowClick={(row) => openObjectPage('Lead', row.id)} />
          </>
        )}

        {activeTab === 'accounts' && (
          <>
            <div className="content-header">
              <h2>Accounts ({organizations?.length || 0})</h2>
              <button className="btn-primary" onClick={() => openObjectPage('Account', 'New Account')}>
                <Target size={16} />
                <span>{t('crm.new_account') || 'New Account'}</span>
              </button>
            </div>
            <DataTable title="Accounts" columns={orgColumns} data={organizations || []} onRowClick={(row) => openObjectPage('Account', row.id)} />
          </>
        )}

        {activeTab === 'quotations' && (
          <>
            <div className="content-header">
              <h2>Quotations</h2>
              <button className="btn-primary" onClick={() => openObjectPage('Quotation', 'New Quotation')}>
                <FileText size={16} />
                <span>New Quotation</span>
              </button>
            </div>
            <DataTable title="Quotations" columns={qtColumns} data={quotations || []} onRowClick={(row) => openObjectPage('Quotation', row.id)} />
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="content-header">
              <h2>Sales Orders</h2>
              <button className="btn-primary" onClick={() => openObjectPage('SalesOrder', 'New Order')}>
                <ShoppingCart size={16} />
                <span>New Order</span>
              </button>
            </div>
            <DataTable title="Sales Orders" columns={orderColumns} data={orders || []} onRowClick={(row) => openObjectPage('SalesOrder', row.id)} />
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  tab: {
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--sap-text-muted)',
    fontSize: '14px',
    fontWeight: 500
  },
  activeTab: {
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--sap-blue)',
    fontSize: '14px',
    fontWeight: 700,
    borderBottom: '3px solid var(--sap-blue)'
  }
};
