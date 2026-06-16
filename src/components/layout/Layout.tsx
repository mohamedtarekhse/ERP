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
  ShoppingBag
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useGlobalStore } from '../../store/globalStore';
import { HREmployeeDetail } from '../modules/HREmployeeDetail';
import { CRMAccountDetail } from '../modules/CRMAccountDetail';
import { AssetCertificateDetail } from '../modules/AssetCertificateDetail';
import { SupplyPODetail } from '../modules/SupplyPODetail';
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
  const { objectPageOpen, closeObjectPage } = useGlobalStore();
  const { user, signOut, role } = useAuth();
  const { data: notifications } = useNotifications(user?.id);
  const markRead = useMarkNotificationRead();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { path: '/hr', label: t('nav.hr'), icon: <Users size={20} /> },
    { path: '/crm', label: t('nav.crm'), icon: <Briefcase size={20} /> },
    { path: '/assets', label: t('nav.assets'), icon: <ShieldCheck size={20} /> },
    { path: '/supply-chain', label: t('nav.supply_chain'), icon: <ShoppingBag size={20} /> },
  ];

  const renderObjectPage = () => {
    if (!objectPageOpen) return null;

    if (location.pathname.startsWith('/hr')) return <HREmployeeDetail />;
    if (location.pathname.startsWith('/crm')) return <CRMAccountDetail />;
    if (location.pathname.startsWith('/assets')) return <AssetCertificateDetail />;
    if (location.pathname.startsWith('/supply-chain')) return <SupplyPODetail />;
    
    return null;
  };

  return (
    <div className="app-container">
      {/* Shell Bar */}
      <header className="shell-bar">
        <div className="shell-left">
          <button className="shell-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
          <div className="shell-logo">
            <h1>{t('app.title')}</h1>
          </div>
        </div>

        <div className="shell-center">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder={t('common.search')} className="search-input" />
          </div>
        </div>

        <div className="shell-right">
          <button className="shell-btn" onClick={toggleLanguage} title={t('common.language')}>
            <Globe size={20} />
            <span className="lang-text">{i18n.language.toUpperCase()}</span>
          </button>
          
          <div style={{ position: 'relative' }}>
            <button className="shell-btn" onClick={() => setIsNotifOpen(!isNotifOpen)} title={t('common.notifications')}>
              <Bell size={20} />
              {notifications && notifications.length > 0 && <span className="badge">{notifications.length}</span>}
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
            <div className="user-profile" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              <div className="avatar">{user?.email?.[0].toUpperCase()}</div>
            </div>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-email">{user?.email}</div>
                  <div className="user-role">{role || 'Employee'}</div>
                </div>
                <button className="dropdown-item" onClick={() => signOut()}>
                  <LogOut size={16} />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <nav className="side-nav">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                onClick={() => objectPageOpen && closeObjectPage()}
              >
                {item.icon}
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="content-area" style={{ position: 'relative' }}>
          {children}
          {renderObjectPage()}
        </main>
      </div>
    </div>
  );
};

export default Layout;
