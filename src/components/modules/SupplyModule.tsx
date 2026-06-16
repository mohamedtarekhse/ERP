import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePurchaseOrders, useSCKPIs, useInventory } from '../../hooks/useSupplyChain';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { ShoppingBag, Truck, Package, Factory, DollarSign } from 'lucide-react';

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
  const { data: purchaseOrders, isLoading: posLoading } = usePurchaseOrders();
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: kpis, isLoading: kpisLoading } = useSCKPIs();

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

  if (posLoading || inventoryLoading || kpisLoading) {
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

      {/* Main Content: Two Sections */}
      <div className="module-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="module-content">
          <div className="content-header">
            <h2>Recent Purchase Orders</h2>
            <button className="btn-primary" onClick={() => openObjectPage('New PO')}>
              <ShoppingBag size={16} />
              <span>{t('sc.new_po') || 'New PO'}</span>
            </button>
          </div>
          <DataTable 
            title="Purchase Orders"
            columns={poColumns} 
            data={purchaseOrders || []} 
            onRowClick={(row) => openObjectPage(row.id)}
          />
        </div>

        <div className="module-content">
          <div className="content-header">
            <h2>{t('sc.inventory')}</h2>
          </div>
          <DataTable 
            title="Inventory"
            columns={inventoryColumns} 
            data={inventory || []} 
          />
        </div>
      </div>
    </div>
  );
};
