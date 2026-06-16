import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGlobalStore } from '../store/globalStore';

export interface ObjectPageTab {
  id: string;
  label: string;
  component: React.ReactNode;
}

interface ObjectPageProps {
  title: string;
  subtitle?: string;
  statusBadge?: { text: string; state: 'Success' | 'Warning' | 'Error' | 'Information' | 'None' };
  headerContent?: React.ReactNode;
  tabs: ObjectPageTab[];
  onSave?: () => void;
  onDelete?: () => void;
  isNew?: boolean;
}

export const ObjectPage: React.FC<ObjectPageProps> = ({
  title,
  subtitle,
  statusBadge,
  headerContent,
  tabs,
  onSave,
  onDelete,
  isNew
}) => {
  const { closeObjectPage } = useGlobalStore();
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id);

  const getStatusColor = (state?: string) => {
    switch (state) {
      case 'Success': return 'var(--sap-green)';
      case 'Error': return 'var(--sap-red)';
      case 'Warning': return 'var(--sap-orange)';
      case 'Information': return 'var(--sap-blue)';
      default: return 'var(--sap-border)';
    }
  };

  return (
    <div style={styles.container}>
      {/* Object Page Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button style={styles.backBtn} onClick={closeObjectPage}>
            <ArrowLeft size={16} />
          </button>
          <div style={styles.titleArea}>
            <h1 style={styles.title}>{title}</h1>
            {subtitle && <span style={styles.subtitle}>{subtitle}</span>}
            {statusBadge && (
              <span style={{
                ...styles.badge,
                backgroundColor: getStatusColor(statusBadge.state),
                color: statusBadge.state === 'None' ? 'var(--sap-text)' : '#fff'
              }}>
                {statusBadge.text}
              </span>
            )}
          </div>
          <div style={styles.globalActions}>
            {!isNew && onDelete && <button style={styles.dangerBtn} onClick={onDelete}>Delete</button>}
            {onSave && <button style={styles.primaryBtn} onClick={onSave}>Save</button>}
            <button style={styles.secondaryBtn} onClick={closeObjectPage}>Cancel</button>
          </div>
        </div>
        
        {headerContent && (
          <div style={styles.headerContent}>
            {headerContent}
          </div>
        )}

        {/* Anchor Bar (Tabs) */}
        <div style={styles.anchorBar}>
          {tabs.map((tab) => (
            <div 
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTabId === tab.id ? styles.activeTab : {})
              }}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        <div style={styles.section}>
          {tabs.find(t => t.id === activeTabId)?.component}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--sap-bg)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute', // Cover the main area
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10
  },
  header: {
    backgroundColor: 'var(--sap-white)',
    borderBottom: '1px solid var(--sap-border)',
    padding: '16px 32px 0 32px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--sap-blue)',
    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 300,
    color: 'var(--sap-text)'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--sap-text-muted)'
  },
  badge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600
  },
  globalActions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '8px'
  },
  headerContent: {
    display: 'flex',
    gap: '32px',
    marginBottom: '16px'
  },
  anchorBar: {
    display: 'flex',
    gap: '24px'
  },
  tab: {
    padding: '8px 0',
    cursor: 'pointer',
    color: 'var(--sap-text-muted)',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
    textTransform: 'uppercase',
    fontWeight: 600
  },
  activeTab: {
    color: 'var(--sap-blue)',
    borderBottomColor: 'var(--sap-blue)'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px'
  },
  section: {
    backgroundColor: 'var(--sap-white)',
    border: '1px solid var(--sap-border)',
    borderRadius: '4px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  primaryBtn: {
    backgroundColor: 'var(--sap-blue)',
    color: 'white',
    border: 'none',
    padding: '6px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px'
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: 'var(--sap-blue)',
    border: '1px solid var(--sap-blue)',
    padding: '6px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px'
  },
  dangerBtn: {
    backgroundColor: 'transparent',
    color: 'var(--sap-red)',
    border: '1px solid var(--sap-red)',
    padding: '6px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px'
  }
};
