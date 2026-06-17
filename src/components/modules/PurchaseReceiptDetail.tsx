import React, { useState, useEffect } from 'react';
import { useGlobalStore } from '../../store/globalStore';
import { useSubmitReceipt, usePurchaseOrders } from '../../hooks/useSupplyChain';
import { ObjectPage } from '../ObjectPage';
import { Package, FileText, Send, Printer } from 'lucide-react';
import { supabase } from '../../db/supabaseClient';

export const PurchaseReceiptDetail: React.FC = () => {
  const { activeRecordId, closeObjectPage } = useGlobalStore();
  
  const isNew = activeRecordId === 'New Receipt';
  const submitReceipt = useSubmitReceipt();
  const { data: pos } = usePurchaseOrders();

  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    purchase_order_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'Draft'
  });

  useEffect(() => {
    if (activeRecordId && !isNew) {
      setLoading(true);
      supabase.from('purchase_receipts').select(`
        *,
        suppliers:supplier_id (*),
        purchase_receipt_items (*)
      `).eq('id', activeRecordId).single().then(({ data }) => {
        setReceipt(data);
        setFormData(data);
        setLoading(false);
      });
    }
  }, [activeRecordId, isNew]);

  const handleSubmit = async () => {
    if (!receipt) return;
    try {
      await submitReceipt.mutateAsync(receipt.id);
      closeObjectPage();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="loading-state">Loading Receipt...</div>;

  const InfoTab = (
    <div className="detail-grid">
      <div className="field-group">
        <label>Purchase Order</label>
        <select 
          value={formData.purchase_order_id} 
          disabled={!isNew}
          onChange={e => setFormData({...formData, purchase_order_id: e.target.value})}
        >
          <option value="">Select PO</option>
          {pos?.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.suppliers?.supplier_name})</option>)}
        </select>
      </div>
      <div className="field-group">
        <label>Receipt Date</label>
        <input type="date" value={formData.transaction_date} readOnly={!isNew} />
      </div>
      <div className="field-group">
        <label>Supplier</label>
        <input value={receipt?.suppliers?.supplier_name || ''} readOnly />
      </div>
    </div>
  );

  const ItemsTab = (
    <div className="tab-container">
      <h3>Items Received</h3>
      <div className="frappe-table-container">
        <table className="frappe-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Qty</th>
              <th>Rate</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {receipt?.purchase_receipt_items?.map((item: any) => (
              <tr key={item.id}>
                <td>{item.item_code}</td>
                <td>{item.qty}</td>
                <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.rate)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'info', label: 'General', icon: <FileText size={16} />, component: InfoTab },
    { id: 'items', label: 'Items', icon: <Package size={16} />, component: ItemsTab }
  ];

  const headerActions = (
    <div style={{ display: 'flex', gap: '8px' }}>
      {receipt?.status === 'Draft' && (
        <button className="btn-frappe btn-frappe-primary" onClick={handleSubmit}>
          <Send size={14} style={{ marginRight: '6px' }} /> Submit & Update Stock
        </button>
      )}
      <button className="btn-frappe btn-frappe-secondary">
        <Printer size={14} style={{ marginRight: '6px' }} /> Print
      </button>
    </div>
  );

  return (
    <ObjectPage 
      title={isNew ? "New Receipt" : receipt?.name}
      subtitle={receipt?.suppliers?.supplier_name}
      statusBadge={{ 
        text: receipt?.status || 'Draft', 
        state: receipt?.status === 'Completed' ? 'Success' : 'Warning' 
      }}
      tabs={tabs}
      headerContent={headerActions}
      isNew={isNew}
    />
  );
};
