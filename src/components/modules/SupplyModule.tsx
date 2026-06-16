import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePurchaseOrders, useSCKPIs, useInventory, useMaterialRequests, usePurchaseReceipts } from '../../hooks/useSupplyChain';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { ShoppingBag, Truck, Package, Factory, ClipboardList, FileCheck } from 'lucide-react';

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
        <span className={`status-pill status-${row.status?.toLowerCase()}`}>
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
        <span className={`status-pill status-${row.workflow_state?.toLowerCase().replace(' ', '-')}`}>
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

  const inventoryColumns = [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: t('sc.item') || 'Item Name' },
    { 
      key: 'actual_qty', 
      label: t('sc.qty') || 'Quantity',
      render: (row: any) => (
        <span style={{ fontWeight: 700, color: row.actual_qty <= row.reorder_level ? 'var(--sap-red)' : 'var(--sap-text)' }}>
          {row.actual_qty}
        </span>
      )
    },
    { key: 'reorder_level', label: t('sc.reorder') || 'Reorder Level' },
    { 
      key: 'stock_status', 
      label: 'Status',
      render: (row: any) => (
        <span className={`status-pill status-${row.stock_status?.toLowerCase()}`}>
          {row.stock_status}
        </span>
      )
    }
  ];

  if (posLoading || inventoryLoading || kpisLoading || reqsLoading || receiptsLoading) {
    return <div className="loading-state">Loading Supply Chain Module...</div>;
  }

  return (
    <div className="module-container">
      {/* KPI Row */}
      <div className="kpi-row">
        <KPICard 
          title="Open Purchase Orders" 
          value={kpis?.open_po_count || 0} 
          icon={<ShoppingBag size={24} />} 
          color="var(--sap-blue)" 
        />
        <KPICard 
          title="Pending Approval" 
          value={kpis?.pending_approval_count || 0} 
          icon={<Truck size={24} />} 
          color="var(--sap-orange)" 
        />
        <KPICard 
          title="Low Stock Items" 
          value={kpis?.low_stock_count || 0} 
          icon={<Package size={24} />} 
          color="var(--sap-red)" 
        />
        <KPICard 
          title="Active Suppliers" 
          value={kpis?.active_supplier_count || 0} 
          icon={<Factory size={24} />} 
          color="var(--sap-green)" 
        />
      </div>

      <div className="module-content">
        <div className="tab-navigation" style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--sap-border)', marginBottom: '24px' }}>
          <button 
            className={`tab-btn ${activeTab === 'pos' ? 'active' : ''}`} 
            onClick={() => setActiveTab('pos')}
            style={activeTab === 'pos' ? styles.activeTab : styles.tab}
          >
            Purchase Orders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reqs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('reqs')}
            style={activeTab === 'reqs' ? styles.activeTab : styles.tab}
          >
            Material Requests
          </button>
          <button 
            className={`tab-btn ${activeTab === 'receipts' ? 'active' : ''}`} 
            onClick={() => setActiveTab('receipts')}
            style={activeTab === 'receipts' ? styles.activeTab : styles.tab}
          >
            Purchase Receipts
          </button>
          <button 
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} 
            onClick={() => setActiveTab('inventory')}
            style={activeTab === 'inventory' ? styles.activeTab : styles.tab}
          >
            Stock Inventory
          </button>
        </div>

        {activeTab === 'pos' && (
          <>
            <div className="content-header">
              <h2>Recent Purchase Orders</h2>
              <button className="btn-primary" onClick={() => openObjectPage('PO', 'New PO')}>
                <ShoppingBag size={16} />
                <span>{t('sc.new_po') || 'New PO'}</span>
              </button>
            </div>
            <DataTable 
              title="Purchase Orders"
              columns={poColumns} 
              data={purchaseOrders || []} 
              onRowClick={(row) => openObjectPage('PO', row.id)}
            />
          </>
        )}

        {activeTab === 'reqs' && (
          <>
            <div className="content-header">
              <h2>Material Requests</h2>
              <button className="btn-primary" onClick={() => openObjectPage('MaterialRequest', 'New Request')}>
                <ClipboardList size={16} />
                <span>New Request</span>
              </button>
            </div>
            <DataTable 
              title="Material Requests"
              columns={reqColumns} 
              data={materialRequests || []} 
              onRowClick={(row) => openObjectPage('MaterialRequest', row.id)}
            />
          </>
        )}

        {activeTab === 'receipts' && (
          <>
            <div className="content-header">
              <h2>Purchase Receipts</h2>
              <button className="btn-primary" onClick={() => openObjectPage('PurchaseReceipt', 'New Receipt')}>
                <FileCheck size={16} />
                <span>New Receipt</span>
              </button>
            </div>
            <DataTable 
              title="Purchase Receipts"
              columns={receiptColumns} 
              data={receipts || []} 
              onRowClick={(row) => openObjectPage('PurchaseReceipt', row.id)}
            />
          </>
        )}

        {activeTab === 'inventory' && (
          <>
            <div className="content-header">
              <h2>{t('sc.inventory')}</h2>
            </div>
            <DataTable 
              title="Inventory"
              columns={inventoryColumns} 
              data={inventory || []} 
            />
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
