import React, { useState } from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
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

  const getPillClass = (state?: string) => {
    switch (state) {
      case 'Success': return 'pill-green';
      case 'Error': return 'pill-red';
      case 'Warning': return 'pill-orange';
      case 'Information': return 'pill-blue';
      default: return '';
    }
  };

  return (
    <div className="object-page-container" style={{
      backgroundColor: 'var(--frappe-white)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 100
    }}>
      {/* Frappe Form Header / Toolbar */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--frappe-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="icon-btn" onClick={closeObjectPage}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--frappe-text)', margin: 0 }}>
              {title}
            </h1>
            {subtitle && <span style={{ fontSize: '12px', color: 'var(--frappe-text-muted)' }}>{subtitle}</span>}
          </div>
          {statusBadge && (
            <span className={`pill ${getPillClass(statusBadge.state)}`} style={{ marginLeft: '8px' }}>
              {statusBadge.text}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isNew && onDelete && (
            <button className="btn-frappe btn-frappe-secondary" style={{ color: 'var(--frappe-red)' }} onClick={onDelete}>
              Delete
            </button>
          )}
          <button className="btn-frappe btn-frappe-secondary" onClick={closeObjectPage}>Cancel</button>
          {onSave && (
            <button className="btn-frappe btn-frappe-primary" onClick={onSave}>
              Save
            </button>
          )}
          <button className="icon-btn"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Tabs / Anchor Bar */}
      <div style={{
        padding: '0 20px',
        borderBottom: '1px solid var(--frappe-border)',
        display: 'flex',
        gap: '24px',
        backgroundColor: '#ffffff'
      }}>
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={{
              padding: '14px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTabId === tab.id ? 600 : 500,
              color: activeTabId === tab.id ? 'var(--frappe-blue)' : 'var(--frappe-text-muted)',
              borderBottom: activeTabId === tab.id ? '2px solid var(--frappe-blue)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '30px', 
        backgroundColor: 'var(--frappe-bg)' 
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {headerContent && (
            <div className="section-card">
              <div className="section-body">{headerContent}</div>
            </div>
          )}
          
          <div className="section-card">
            <div className="section-body">
              {tabs.find(t => t.id === activeTabId)?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
