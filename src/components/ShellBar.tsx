import React from 'react';
import { Search, Bell, Grid, Settings } from 'lucide-react';
import { useGlobalStore } from '../store/globalStore';
import { translations } from '../i18n/translations';

export const ShellBar: React.FC = () => {
  const { language, toggleLanguage, navigate } = useGlobalStore();
  const t = translations[language];

  return (
    <header style={styles.shell}>
      <div style={{...styles.logoContainer, cursor: 'pointer'}} onClick={() => navigate('launchpad')}>
        <svg viewBox="0 0 40 24" fill="none" style={styles.logoSvg}>
          <rect width="40" height="24" rx="2" fill="#008fd3"/>
          <text x="4" y="17" fill="#fff" fontWeight="900" fontSize="13" fontFamily="Arial">AMICI</text>
        </svg>
        <div style={styles.separator}></div>
        <span>{t.erpSystem}</span>
      </div>
      
      <div style={styles.spacer}></div>
      
      <div style={styles.searchBox}>
        <Search size={16} />
        <input 
          type="text" 
          placeholder={t.search} 
          style={styles.searchInput} 
        />
      </div>
      
      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage}
        style={styles.langBtn}
        title="Toggle Language"
      >
        {language === 'en' ? 'عر' : 'EN'}
      </button>

      <div style={styles.iconBtn} title={t.notifications}><Bell size={18} /></div>
      <div style={styles.iconBtn} title="Apps"><Grid size={18} /></div>
      <div style={styles.iconBtn} title={t.settings}><Settings size={18} /></div>
      
      <div style={styles.avatar}>MT</div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'flex',
    alignItems: 'center',
    height: '44px',
    backgroundColor: 'var(--sap-shell)',
    padding: '0 12px',
    gap: '8px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    color: 'var(--sap-shell-text)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 700,
    fontSize: '13px',
    letterSpacing: '0.5px'
  },
  logoSvg: {
    width: '32px',
    height: '20px'
  },
  separator: {
    width: '1px',
    height: '24px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    margin: '0 4px'
  },
  spacer: {
    flex: 1
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '3px',
    padding: '0 8px',
    height: '30px',
    gap: '6px',
    width: '280px',
    marginRight: '8px'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '13px',
    width: '100%',
  },
  langBtn: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '3px',
    padding: '2px 8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
    marginRight: '8px'
  },
  iconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--sap-blue)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    marginLeft: '4px'
  }
};
