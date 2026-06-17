import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePurchaseOrders, useSCKPIs, useInventory, useMaterialRequests, usePurchaseReceipts } from '../../hooks/useSupplyChain';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { ShoppingBag, ClipboardList, FileCheck } from 'lucide-react';

const KPICard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="kpi-card">
    <span className="kpi-label">{title}</span>
    <span className="kpi-value">{value}</span>
  </div>
);

export const SupplyModule: React.FC = () => {
  const { t } = useTranslation();
  const { openObjectPage } = useGlobalStore();
  const [activeTab, setActiveTab] = useState<'pos' | 'reqs' | 'receipts' | 'inventory'>('pos');
  
  const { data: purchaseOrders, isLoading: posLoading } = usePurchaseOrders();
  const { data: materialRequests, isLoading: reqsLoading } = useMaterialRequests();
  const { data: receipts, isLoading: receiptsLoading } = usePurchaseReceipts();
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: kpis, isLoading: kpisLoading } = useSCKPIs();

  const reqColumns = [
    { key: 'name', label: 'ID' },
    { key: 'transaction_date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { 
      key: 'status', 
      label: 'Status',
      render: (row: any) => (
        <span className={`pill pill-${row.status === 'Submitted' ? 'green' : 'orange'}`}>
          {row.status}
        </span>
      )
    }
  ];

  const poColumns = [
    { key: 'name', label: t('sc.po_name') || 'PO Number' },
    { 
      key: 'supplier', 
      label: t('sc.supplier') || 'Supplier',
      render: (row: any) => row.suppliers?.supplier_name || '-'
    },
    { key: 'transaction_date', label: 'Date' },
    { 
      key: 'workflow_state', 
      label: 'Status',
      render: (row: any) => (
        <span className={`pill pill-${row.workflow_state === 'Approved' ? 'green' : 'blue'}`}>
          {row.workflow_state}
        </span>
      )
    },
    { 
      key: 'grand_total', 
      label: t('sc.total') || 'Total',
      render: (row: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: row.currency || 'USD' }).format(row.grand_total || 0)
    }
  ];

  const receiptColumns = [
    { key: 'name', label: 'ID' },
    { 
      key: 'supplier', 
      label: 'Supplier',
      render: (row: any) => row.suppliers?.supplier_name || '-'
    },
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

  const inventoryColumns = [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: t('sc.item') || 'Item Name' },
    { 
      key: 'actual_qty', 
      label: t('sc.qty') || 'Quantity',
      render: (row: any) => (
        <span style={{ fontWeight: 700, color: row.actual_qty <= row.reorder_level ? 'var(--frappe-red)' : 'var(--frappe-text)' }}>
          {row.actual_qty}
        </span>
      )
    },
    { key: 'reorder_level', label: t('sc.reorder') || 'Reorder Level' },
    { 
      key: 'stock_status', 
      label: 'Status',
      render: (row: any) => (
        <span className={`pill pill-${row.stock_status === 'Instock' ? 'green' : 'red'}`}>
          {row.stock_status}
        </span>
      )
    }
  ];

  if (posLoading || inventoryLoading || kpisLoading || reqsLoading || receiptsLoading) {
    return <div className="loading-state">Loading Supply Chain Workspace...</div>;
  }

  return (
    <div className="workspace-container">
      <header className="workspace-header">
        <h1 className="workspace-title">{t('nav.supply_chain')}</h1>
      </header>

      {/* KPI Row - Frappe style cards */}
      <div className="kpi-grid">
        <KPICard title="Open POs" value={kpis?.open_po_count || 0} />
        <KPICard title="Pending Approval" value={kpis?.pending_approval_count || 0} />
        <KPICard title="Low Stock Items" value={kpis?.low_stock_count || 0} />
        <KPICard title="Active Suppliers" value={kpis?.active_supplier_count || 0} />
      </div>

      <div className="section-card">
        <div className="section-header" style={{ display: 'flex', gap: '20px', padding: '0 20px' }}>
          <button onClick={() => setActiveTab('pos')} className={`tab-link ${activeTab === 'pos' ? 'active' : ''}`}>Purchase Orders</button>
          <button onClick={() => setActiveTab('reqs')} className={`tab-link ${activeTab === 'reqs' ? 'active' : ''}`}>Material Requests</button>
          <button onClick={() => setActiveTab('receipts')} className={`tab-link ${activeTab === 'receipts' ? 'active' : ''}`}>Purchase Receipts</button>
          <button onClick={() => setActiveTab('inventory')} className={`tab-link ${activeTab === 'inventory' ? 'active' : ''}`}>Stock Inventory</button>
        </div>

        <div className="section-body" style={{ padding: 0 }}>
          {activeTab === 'pos' && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Recent Purchase Orders</span>
                <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('PO', 'New')}>
                  <ShoppingBag size={14} style={{ marginRight: '6px' }} />
                  {t('sc.new_po') || 'New PO'}
                </button>
              </div>
              <DataTable columns={poColumns} data={purchaseOrders || []} onRowClick={(row) => openObjectPage('PO', row.id)} />
            </>
          )}

          {activeTab === 'reqs' && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Material Requests</span>
                <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('MaterialRequest', 'New')}>
                  <ClipboardList size={14} style={{ marginRight: '6px' }} />
                  New Request
                </button>
              </div>
              <DataTable columns={reqColumns} data={materialRequests || []} onRowClick={(row) => openObjectPage('MaterialRequest', row.id)} />
            </>
          )}

          {activeTab === 'receipts' && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Purchase Receipts</span>
                <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('PurchaseReceipt', 'New')}>
                  <FileCheck size={14} style={{ marginRight: '6px' }} />
                  New Receipt
                </button>
              </div>
              <DataTable columns={receiptColumns} data={receipts || []} onRowClick={(row) => openObjectPage('PurchaseReceipt', row.id)} />
            </>
          )}

          {activeTab === 'inventory' && (
            <>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--frappe-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Stock Inventory</span>
              </div>
              <DataTable columns={inventoryColumns} data={inventory || []} />
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
