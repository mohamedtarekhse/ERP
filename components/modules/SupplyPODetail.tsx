import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '../../store/globalStore';
import { usePurchaseOrder, useSubmitPO, useApprovePO, useReceivePO } from '../../hooks/useSupplyChain';
import { ObjectPage } from '../ObjectPage';
import { Truck, Package, CheckCircle, FileText, Send, Printer } from 'lucide-react';

export const SupplyPODetail: React.FC = () => {
  const { t } = useTranslation();
  const { activeRecordId, closeObjectPage } = useGlobalStore();
  
  const isNew = activeRecordId === 'New';
  const { data: po, isLoading: isPOLoading } = usePurchaseOrder(!isNew ? activeRecordId : null);
  
  const submitPO = useSubmitPO();
  const approvePO = useApprovePO();
  const receivePO = useReceivePO();

  const [formData, setFormData] = useState<any>({
    supplier_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    schedule_date: '',
    currency: 'USD',
    priority: 'Normal',
    workflow_state: 'Draft'
  });

  useEffect(() => {
    if (po) {
      setFormData(po);
    }
  }, [po]);

  const handleAction = async (action: 'submit' | 'approve' | 'receive') => {
    if (!po) return;
    try {
      if (action === 'submit') await submitPO.mutateAsync(po.id);
      if (action === 'approve') await approvePO.mutateAsync(po.id);
      if (action === 'receive') await receivePO.mutateAsync(po.id);
      closeObjectPage();
    } catch (e) {
      console.error(e);
    }
  };

  if (activeRecordId && !isNew && isPOLoading) {
    return <div className="loading-state">Loading Purchase Order...</div>;
  }

  const InfoTab = (
    <div className="detail-grid">
      <div className="field-group">
        <label>{t('sc.supplier')}</label>
        <input value={po?.suppliers?.supplier_name || ''} readOnly />
      </div>
      <div className="field-group">
        <label>Transaction Date</label>
        <input type="date" value={formData.transaction_date} readOnly />
      </div>
      <div className="field-group">
        <label>Required By Date</label>
        <input type="date" value={formData.schedule_date} readOnly />
      </div>
      <div className="field-group">
        <label>{t('sc.priority')}</label>
        <input value={formData.priority} readOnly />
      </div>
      <div className="field-group">
        <label>Requested By</label>
        <input value={po?.employees ? `${po.employees.first_name} ${po.employees.last_name}` : ''} readOnly />
      </div>
      <div className="field-group">
        <label>Warehouse / Delivery Location</label>
        <input value={po?.warehouses?.warehouse_name || ''} readOnly />
      </div>
    </div>
  );

  const ItemsTab = (
    <div className="tab-container">
      <h3>PO Line Items</h3>
      <div className="frappe-table-container">
        <table className="frappe-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {po?.purchase_order_items?.map((item: any) => (
              <tr key={item.id}>
                <td>{item.item_code}</td>
                <td>{item.item_name}</td>
                <td>{item.qty} {item.uom}</td>
                <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: po.currency }).format(item.rate)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: po.currency }).format(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ padding: '12px', textAlign: 'right', fontWeight: 700, fontSize: '14px', borderTop: '2px solid var(--frappe-border)' }}>Grand Total:</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, fontSize: '16px', color: 'var(--frappe-blue)', borderTop: '2px solid var(--frappe-border)' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: po?.currency || 'USD' }).format(po?.grand_total || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'info', label: 'Order Info', icon: <FileText size={16} />, component: InfoTab },
    { id: 'items', label: 'Line Items', icon: <Package size={16} />, component: ItemsTab }
  ];

  const renderWorkflowActions = () => {
    if (isNew) return null;
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {po?.workflow_state === 'Draft' && (
          <button className="btn-frappe btn-frappe-primary" onClick={() => handleAction('submit')}>
            <Send size={14} style={{ marginRight: '6px' }} /> Submit for Approval
          </button>
        )}
        {po?.workflow_state === 'Pending Approval' && (
          <button className="btn-frappe btn-frappe-primary" style={{ backgroundColor: 'var(--frappe-green)' }} onClick={() => handleAction('approve')}>
            <CheckCircle size={14} style={{ marginRight: '6px' }} /> Approve PO
          </button>
        )}
        {po?.workflow_state === 'Approved' && (
          <button className="btn-frappe btn-frappe-primary" onClick={() => handleAction('receive')}>
            <Truck size={14} style={{ marginRight: '6px' }} /> Mark as Received
          </button>
        )}
        <button className="btn-frappe btn-frappe-secondary">
          <Printer size={14} style={{ marginRight: '6px' }} /> Print
        </button>
      </div>
    );
  };

  return (
    <ObjectPage 
      title={isNew ? t('sc.new_po') : po?.name}
      subtitle={po?.suppliers?.supplier_name}
      statusBadge={{ 
        text: po?.workflow_state || 'Draft', 
        state: po?.workflow_state === 'Completed' ? 'Success' : po?.workflow_state === 'Cancelled' ? 'Error' : 'Warning' 
      }}
      tabs={tabs}
      headerContent={renderWorkflowActions()}
      isNew={isNew}
    />
  );
};
