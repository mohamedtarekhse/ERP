import React from 'react';
import { useGlobalStore } from '../store/globalStore';
import { translations } from '../i18n/translations';
import { Users, UserPlus, Calendar, Clock, Building2, Target, ShieldCheck, AlertTriangle, Package, Truck, Box, CheckSquare } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { language, currentApp } = useGlobalStore();
  const t = translations[language];

  const hrLinks = [
    { icon: <Users size={16} />, label: t.employees, badge: 15 },
    { icon: <UserPlus size={16} />, label: t.newHire, badge: 2 },
    { icon: <Calendar size={16} />, label: t.leaveRequest, badge: 1 },
    { icon: <Clock size={16} />, label: t.timesheets, badge: 0 }
  ];

  const crmLinks = [
    { icon: <Building2 size={16} />, label: t.accounts, badge: 15 },
    { icon: <Target size={16} />, label: t.opportunities, badge: 5 }
  ];

  const certLinks = [
    { icon: <ShieldCheck size={16} />, label: t.equipment, badge: 15 },
    { icon: <AlertTriangle size={16} color="var(--sap-red)" />, label: t.expired, badge: 4 },
    { icon: <CheckSquare size={16} />, label: t.valid, badge: 10 }
  ];

  const supplyLinks = [
    { icon: <Package size={16} />, label: t.purchaseOrders, badge: 15 },
    { icon: <Box size={16} />, label: t.inventory, badge: 120 },
    { icon: <Truck size={16} />, label: t.supplier, badge: 8 }
  ];

  let activeLinks = hrLinks;
  if (currentApp === 'crm') activeLinks = crmLinks;
  if (currentApp === 'certificates') activeLinks = certLinks;
  if (currentApp === 'supply_chain') activeLinks = supplyLinks;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarGroup}>
        {activeLinks.map((link, i) => (
          <div key={i} style={styles.sidebarItem} className={i === 0 ? 'active' : ''}>
            <span style={styles.iconWrapper}>{link.icon}</span>
            <span style={styles.linkLabel}>{link.label}</span>
            {link.badge > 0 && <span style={styles.badge}>{link.badge}</span>}
          </div>
        ))}
      </div>
      
      {/* Global CSS for hover state is added in index.css but since it's inline, let's just make it simple */}
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '240px',
    backgroundColor: 'var(--sap-white)',
    borderRight: '1px solid var(--sap-border)',
    overflowY: 'auto',
    height: '100%',
  },
  sidebarGroup: {
    padding: '8px 0'
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    cursor: 'pointer',
    color: 'var(--sap-text)',
    fontSize: '13px',
    borderLeft: '3px solid transparent'
  },
  iconWrapper: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center'
  },
  linkLabel: {
    flex: 1
  },
  badge: {
    backgroundColor: 'var(--sap-blue-light)',
    color: 'var(--sap-blue)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 700
  }
};
