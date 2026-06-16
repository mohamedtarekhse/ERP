import React from 'react';
import { useGlobalStore } from '../store/globalStore';
import { useDataStore } from '../store/dataStore';
import { Users, Building2, ShieldCheck, Package } from 'lucide-react';

export const Launchpad: React.FC = () => {
  const { navigate } = useGlobalStore();
  const { employees, accounts, certificates, purchaseOrders } = useDataStore();

  const expiringCerts = certificates.filter(c => c.status === 'Expired' || c.status === 'Expiring Soon').length;

  return (
    <div style={styles.container}>
      <h2 style={styles.groupTitle}>Human Resources</h2>
      <div style={styles.tileGroup}>
        <div style={styles.tile} onClick={() => navigate('hr')}>
          <div style={styles.tileHeader}>
            <span style={styles.tileTitle}>Manage Employees</span>
            <Users size={20} color="var(--sap-blue)" />
          </div>
          <div style={styles.tileContent}>
            <span style={styles.kpi}>{employees.length}</span>
            <span style={styles.kpiLabel}>Total Active</span>
          </div>
        </div>
      </div>

      <h2 style={styles.groupTitle}>Customer Relations</h2>
      <div style={styles.tileGroup}>
        <div style={styles.tile} onClick={() => navigate('crm')}>
          <div style={styles.tileHeader}>
            <span style={styles.tileTitle}>Manage Accounts</span>
            <Building2 size={20} color="var(--sap-blue)" />
          </div>
          <div style={styles.tileContent}>
            <span style={styles.kpi}>{accounts.length}</span>
            <span style={styles.kpiLabel}>Corporate Accounts</span>
          </div>
        </div>
      </div>

      <h2 style={styles.groupTitle}>Asset Management</h2>
      <div style={styles.tileGroup}>
        <div style={styles.tile} onClick={() => navigate('certificates')}>
          <div style={styles.tileHeader}>
            <span style={styles.tileTitle}>Monitor Certificates</span>
            <ShieldCheck size={20} color="var(--sap-blue)" />
          </div>
          <div style={styles.tileContent}>
            <span style={{...styles.kpi, color: expiringCerts > 0 ? 'var(--sap-red)' : 'var(--sap-text)'}}>{expiringCerts}</span>
            <span style={styles.kpiLabel}>Action Required</span>
          </div>
        </div>
      </div>

      <h2 style={styles.groupTitle}>Supply Chain</h2>
      <div style={styles.tileGroup}>
        <div style={styles.tile} onClick={() => navigate('supply_chain')}>
          <div style={styles.tileHeader}>
            <span style={styles.tileTitle}>Purchase Orders</span>
            <Package size={20} color="var(--sap-blue)" />
          </div>
          <div style={styles.tileContent}>
            <span style={styles.kpi}>{purchaseOrders.length}</span>
            <span style={styles.kpiLabel}>Open Orders</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  groupTitle: {
    fontSize: '18px',
    fontWeight: 300,
    color: 'var(--sap-text)',
    marginBottom: '16px',
    marginTop: '32px'
  },
  tileGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  tile: {
    width: '176px',
    height: '176px',
    backgroundColor: 'var(--sap-white)',
    border: '1px solid var(--sap-border)',
    borderRadius: '4px',
    padding: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s'
  },
  tileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  tileTitle: {
    fontSize: '14px',
    color: 'var(--sap-text)',
    fontWeight: 600,
    maxWidth: '110px'
  },
  tileContent: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  kpi: {
    fontSize: '36px',
    fontWeight: 300,
    color: 'var(--sap-text)',
    lineHeight: 1
  },
  kpiLabel: {
    fontSize: '12px',
    color: 'var(--sap-text-muted)',
    marginTop: '4px'
  }
};
