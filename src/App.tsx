import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { HRModule } from './components/modules/HRModule';
import { CRMModule } from './components/modules/CRMModule';
import { AssetModule } from './components/modules/CertModule';
import { SupplyModule } from './components/modules/SupplyModule';
import { AuthProvider } from './context/AuthContext';
import './App.css';

const AppContent = () => {
  // Phase 1: Authentication is bypassed for development and public demo.
  // The backend uses anonymous RLS policies.
  // const { session, loading } = useAuth();
  // if (loading) return <div className="loading-state">Initializing System...</div>;
  // if (!session) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/hr" replace />} />
        <Route path="/hr/*" element={<HRModule />} />
        <Route path="/crm/*" element={<CRMModule />} />
        <Route path="/assets/*" element={<AssetModule />} />
        <Route path="/supply-chain/*" element={<SupplyModule />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
