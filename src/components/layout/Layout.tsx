import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Search, 
  Menu, 
  Globe, 
  LogOut,
  Users,
  Briefcase,
  ShieldCheck,
  ShoppingBag,
  ChevronRight,
  Home
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../store/globalStore';
import { HREmployeeDetail } from '../modules/HREmployeeDetail';
import { CRMAccountDetail } from '../modules/CRMAccountDetail';
import { AssetCertificateDetail } from '../modules/AssetCertificateDetail';
import { SupplyPODetail } from '../modules/SupplyPODetail';
import { PurchaseReceiptDetail } from '../modules/PurchaseReceiptDetail';
import { useAuth } from '../../context/AuthContext';
import { useNotifications, useMarkNotificationRead } from '../../hooks/useNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { objectPageOpen, closeObjectPage, activeObjectType } = useGlobalStore();
  const { user, signOut, role } = useAuth();
  const { data: notifications } = useNotifications(user?.id);
  const markRead = useMarkNotificationRead();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { path: '/hr', label: t('nav.hr'), icon: <Users size={18} /> },
    { path: '/crm', label: t('nav.crm'), icon: <Briefcase size={18} /> },
    { path: '/assets', label: t('nav.assets'), icon: <ShieldCheck size={18} /> },
    { path: '/supply-chain', label: t('nav.supply_chain'), icon: <ShoppingBag size={18} /> },
  ];

  // Dynamic Breadcrumbs logic for Frappe v15 style
  const pathSegments = location.pathname.split('/').filter(p => p);
  
  interface BreadcrumbItem {
    label: string;
    path: string;
    icon?: React.ReactNode;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/', icon: <Home size={14} /> },
    ...pathSegments.map((segment, index) => ({
      label: t(`nav.${segment.replace('-', '_')}`) || segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + pathSegments.slice(0, index + 1).join('/')
    }))
  ];

  const renderObjectPage = () => {
    if (!objectPageOpen) return null;

    switch (activeObjectType) {
      case 'Employee': return <HREmployeeDetail />;
      case 'Account': return <CRMAccountDetail />;
      case 'Lead': return <div className="p-4">Lead Detail (To be implemented)</div>;
      case 'Quotation': return <div className="p-4">Quotation Detail (To be implemented)</div>;
      case 'SalesOrder': return <div className="p-4">Sales Order Detail (To be implemented)</div>;
      case 'Certificate': return <AssetCertificateDetail />;
      case 'PO': return <SupplyPODetail />;
      case 'PurchaseReceipt': return <PurchaseReceiptDetail />;
      default: return null;
    }
  };

  return (
    <div className="app-container">
      {/* Navbar (Frappe Shell) */}
      <nav className="navbar">
        <div className="navbar-left">
          <button className="icon-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
          
          <div className="breadcrumb-container">
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={bc.path}>
                <div 
                  className="breadcrumb-item" 
                  onClick={() => navigate(bc.path)}
                >
                  {bc.icon && <span style={{ marginRight: '6px', display: 'flex' }}>{bc.icon}</span>}
                  {bc.label}
                </div>
                {i < breadcrumbs.length - 1 && <ChevronRight size={12} className="breadcrumb-separator" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="navbar-center">
          <div className="search-container">
            <Search size={16} className="search-icon-fixed" />
            <input 
              type="text" 
              placeholder={t('common.search') + " (Cmd+K)"} 
              className="search-input" 
            />
          </div>
        </div>

        <div className="navbar-right">
          <button className="icon-btn" onClick={toggleLanguage} title={t('common.language')}>
            <Globe size={18} />
            <span style={{ marginLeft: '4px', fontSize: '12px', fontWeight: 600 }}>
              {i18n.language.toUpperCase()}
            </span>
          </button>
          
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)} title={t('common.notifications')}>
              <Bell size={18} />
              {notifications && notifications.length > 0 && (
                <span style={{
                  position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px',
                  backgroundColor: 'var(--frappe-red)', borderRadius: '50%', border: '2px solid white'
                }}></span>
              )}
            </button>
            {isNotifOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">Notifications</div>
                <div className="notif-list">
                  {notifications?.length === 0 && <div className="notif-empty">No new alerts</div>}
                  {notifications?.map(n => (
                    <div key={n.id} className="notif-item" onClick={() => { markRead.mutate(n.id); setIsNotifOpen(false); }}>
                      <div className="notif-subject">{n.subject}</div>
                      <div className="notif-time">{new Date(n.created_at).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <div className="user-profile" style={{ cursor: 'pointer' }} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              <div className="user-avatar">{user?.email?.[0].toUpperCase() || 'U'}</div>
            </div>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-email">{user?.email}</div>
                  <div className="user-role">{role || 'Employee'}</div>
                </div>
                <button className="dropdown-item" onClick={() => signOut()}>
                  <LogOut size={14} />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="nav-group">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                onClick={() => objectPageOpen && closeObjectPage()}
              >
                {item.icon}
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="content-area">
          {children}
          {renderObjectPage()}
        </main>
      </div>
    </div>
  );
};

export default Layout;
