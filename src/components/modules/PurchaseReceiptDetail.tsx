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
      <table className="po-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--sap-border)', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Item Code</th>
            <th style={{ padding: '12px' }}>Qty</th>
            <th style={{ padding: '12px' }}>Rate</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {receipt?.purchase_receipt_items?.map((item: any) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--sap-border)' }}>
              <td style={{ padding: '12px' }}>{item.item_code}</td>
              <td style={{ padding: '12px' }}>{item.qty}</td>
              <td style={{ padding: '12px' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.rate)}</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tabs = [
    { id: 'info', label: 'General', icon: <FileText size={16} />, component: InfoTab },
    { id: 'items', label: 'Items', icon: <Package size={16} />, component: ItemsTab }
  ];

  const headerActions = (
    <div style={{ display: 'flex', gap: '8px' }}>
      {receipt?.status === 'Draft' && (
        <button className="btn-primary" onClick={handleSubmit}>
          <Send size={16} /> Submit & Update Stock
        </button>
      )}
      <button className="btn-secondary"><Printer size={16} /> Print</button>
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
