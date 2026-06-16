import React from 'react';
import { useGlobalStore } from '../store/globalStore';
import { translations } from '../i18n/translations';

export const ModuleNav: React.FC = () => {
  const { language, currentApp, navigate } = useGlobalStore();
  const t = translations[language];

  if (currentApp === 'launchpad') return null;

  return (
    <nav style={styles.navBar}>
      <div 
        style={{ ...styles.navTab, ...(currentApp === 'hr' ? styles.activeTab : {}) }} 
        onClick={() => navigate('hr')}
      >
        {t.hrModule}
      </div>
      <div 
        style={{ ...styles.navTab, ...(currentApp === 'crm' ? styles.activeTab : {}) }} 
        onClick={() => navigate('crm')}
      >
        {t.crmModule}
      </div>
      <div 
        style={{ ...styles.navTab, ...(currentApp === 'certificates' ? styles.activeTab : {}) }} 
        onClick={() => navigate('certificates')}
      >
        {t.certModule}
      </div>
      <div 
        style={{ ...styles.navTab, ...(currentApp === 'supply_chain' ? styles.activeTab : {}) }} 
        onClick={() => navigate('supply_chain')}
      >
        {t.supplyModule}
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navBar: {
    backgroundColor: 'var(--sap-white)',
    borderBottom: '1px solid var(--sap-border)',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    overflowX: 'auto'
  },
  navTab: {
    padding: '0 14px',
    height: '36px',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '13px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    color: 'var(--sap-text-muted)',
    whiteSpace: 'nowrap'
  },
  activeTab: {
    color: 'var(--sap-blue)',
    borderBottomColor: 'var(--sap-blue)',
    fontWeight: 600
  }
};
