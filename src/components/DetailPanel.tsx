import React from 'react';
import { X } from 'lucide-react';
import { useGlobalStore } from '../store/globalStore';
import { translations } from '../i18n/translations';
import { HREmployeeDetail } from './modules/HREmployeeDetail';
import { CRMAccountDetail } from './modules/CRMAccountDetail';

export const DetailPanel: React.FC = () => {
  const { language, objectPageOpen, closeObjectPage, activeRecordId, currentApp } = useGlobalStore();
  const t = translations[language];

  if (!objectPageOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t.edit} - {activeRecordId}</h2>
          <button style={styles.closeBtn} onClick={closeObjectPage}>
            <X size={20} />
          </button>
        </div>
        <div style={styles.content}>
          {currentApp === 'hr' && <HREmployeeDetail />}
          {currentApp === 'crm' && <CRMAccountDetail />}
          {currentApp !== 'hr' && currentApp !== 'crm' && (
            <div>
              <p>Detail view for {activeRecordId} goes here.</p>
              <div style={styles.actionBar}>
                <button style={styles.primaryBtn}>{t.save}</button>
                <button style={styles.secondaryBtn} onClick={closeObjectPage}>{t.cancel}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  panel: {
    width: '600px',
    maxWidth: '100%',
    backgroundColor: 'var(--sap-white)',
    height: '100%',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    height: '44px',
    borderBottom: '1px solid var(--sap-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    backgroundColor: 'var(--sap-bg)'
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--sap-text)'
  },
  content: {
    padding: '16px',
    flex: 1,
    overflowY: 'auto'
  },
  actionBar: {
    marginTop: '24px',
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    borderTop: '1px solid var(--sap-border)',
    paddingTop: '16px'
  },
  primaryBtn: {
    backgroundColor: 'var(--sap-blue)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: 'var(--sap-blue)',
    border: '1px solid var(--sap-blue)',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600
  }
};
