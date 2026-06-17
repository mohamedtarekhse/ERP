import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCRMOrganizations, useCRMKPIs, useCRMLeads, useCRMQuotations, useCRMSalesOrders } from '../../hooks/useCRM';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { UserPlus, Target, FileText, ShoppingCart } from 'lucide-react';

const KPICard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="kpi-card">
    <span className="kpi-label">{title}</span>
    <span className="kpi-value">{value}</span>
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
        <span className={`pill pill-${row.status === 'Open' ? 'blue' : 'green'}`}>
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
        <span className="rating-pill">
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
        <span className="pill pill-blue">{row.status}</span>
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
        <span className="pill pill-green">{row.workflow_state}</span>
      )
    },
    { 
      key: 'grand_total', 
      label: 'Total',
      render: (row: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.grand_total || 0)
    }
  ];

  if (orgsLoading || kpisLoading || leadsLoading || qtsLoading || ordersLoading) {
    return <div className="loading-state">Loading CRM Workspace...</div>;
  }

  return (
    <div className="workspace-container">
      <header className="workspace-header">
        <h1 className="workspace-title">{t('nav.crm')}</h1>
      </header>

      <div className="kpi-grid">
        <KPICard title="Total Accounts" value={kpis?.total_organizations || 0} />
        <KPICard title="Contract Value" value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpis?.active_contract_value || 0)} />
        <KPICard title="Win Rate" value={`${kpis?.win_rate || 0}%`} />
        <KPICard title="Overdue Tasks" value={kpis?.overdue_activities || 0} />
      </div>

      <div className="section-card">
        <div className="section-header" style={{ display: 'flex', gap: '20px', padding: '0 20px' }}>
          <button onClick={() => setActiveTab('leads')} className={`tab-link ${activeTab === 'leads' ? 'active' : ''}`}>Leads</button>
          <button onClick={() => setActiveTab('accounts')} className={`tab-link ${activeTab === 'accounts' ? 'active' : ''}`}>Accounts</button>
          <button onClick={() => setActiveTab('quotations')} className={`tab-link ${activeTab === 'quotations' ? 'active' : ''}`}>Quotations</button>
          <button onClick={() => setActiveTab('orders')} className={`tab-link ${activeTab === 'orders' ? 'active' : ''}`}>Sales Orders</button>
        </div>

        <div className="section-body" style={{ padding: 0 }}>
          {activeTab === 'leads' && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Recent Leads</span>
                <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('Lead', 'New')}>
                  <UserPlus size={14} style={{ marginRight: '6px' }} />
                  New Lead
                </button>
              </div>
              <DataTable columns={leadColumns} data={leads || []} onRowClick={(row) => openObjectPage('Lead', row.id)} />
            </>
          )}

          {activeTab === 'accounts' && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Customer Master</span>
                <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('Account', 'New')}>
                  <Target size={14} style={{ marginRight: '6px' }} />
                  New Account
                </button>
              </div>
              <DataTable columns={orgColumns} data={organizations || []} onRowClick={(row) => openObjectPage('Account', row.id)} />
            </>
          )}

          {activeTab === 'quotations' && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Draft Quotations</span>
                <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('Quotation', 'New')}>
                  <FileText size={14} style={{ marginRight: '6px' }} />
                  New Quotation
                </button>
              </div>
              <DataTable columns={qtColumns} data={quotations || []} onRowClick={(row) => openObjectPage('Quotation', row.id)} />
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Sales Orders</span>
                <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('SalesOrder', 'New')}>
                  <ShoppingCart size={14} style={{ marginRight: '6px' }} />
                  New Order
                </button>
              </div>
              <DataTable columns={orderColumns} data={orders || []} onRowClick={(row) => openObjectPage('SalesOrder', row.id)} />
            </>
          )}
        </div>
      </div>

      <style>{`
        .tab-link {
          padding: 14px 0;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--frappe-text-muted);
          font-size: 13px;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .tab-link.active {
          color: var(--frappe-blue);
          border-bottom-color: var(--frappe-blue);
          font-weight: 600;
        }
        .tab-link:hover:not(.active) {
          color: var(--frappe-text);
        }
      `}</style>
    </div>
  );
};
