import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployees, useHRKPIs } from '../../hooks/useHR';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { UserPlus } from 'lucide-react';

const KPICard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="kpi-card">
    <span className="kpi-label">{title}</span>
    <span className="kpi-value">{value}</span>
  </div>
);

export const HRModule: React.FC = () => {
  const { t } = useTranslation();
  const { openObjectPage } = useGlobalStore();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: kpis, isLoading: kpisLoading } = useHRKPIs();

  const columns = [
    { key: 'name', label: t('hr.employee_id') || 'ID' },
    { key: 'first_name', label: t('hr.first_name') || 'First Name' },
    { key: 'last_name', label: t('hr.last_name') || 'Last Name' },
    { 
      key: 'department', 
      label: t('hr.department') || 'Department',
      render: (row: any) => row.departments?.name || '-'
    },
    { 
      key: 'designation', 
      label: t('hr.designation') || 'Designation',
      render: (row: any) => row.designations?.name || '-'
    },
    { 
      key: 'status', 
      label: t('hr.status') || 'Status',
      render: (row: any) => (
        <span className={`pill pill-${row.status === 'Active' ? 'green' : 'orange'}`}>
          {row.status}
        </span>
      )
    }
  ];

  if (employeesLoading || kpisLoading) {
    return <div className="loading-state">Loading HR Workspace...</div>;
  }

  return (
    <div className="workspace-container">
      <header className="workspace-header">
        <h1 className="workspace-title">{t('nav.hr')}</h1>
      </header>

      {/* KPI Row - Frappe style cards */}
      <div className="kpi-grid">
        <KPICard title="Total Headcount" value={kpis?.total_headcount || 0} />
        <KPICard title="Active Employees" value={kpis?.active_count || 0} />
        <KPICard title="Field Crew" value={kpis?.field_crew_count || 0} />
        <KPICard title="Pending Leaves" value={kpis?.pending_leaves || 0} />
      </div>

      {/* Main Content - Workspace Section */}
      <div className="section-card">
        <div className="section-header">
          <span>{t('hr.employee_list') || 'Employee Master'}</span>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-frappe btn-frappe-primary" onClick={() => openObjectPage('Employee', 'New')}>
              <UserPlus size={14} style={{ marginRight: '6px' }} />
              {t('hr.new_employee') || 'Add Employee'}
            </button>
          </div>
        </div>
        
        <div className="section-body" style={{ padding: 0 }}>
          <DataTable 
            columns={columns} 
            data={employees || []} 
            onRowClick={(row) => openObjectPage('Employee', row.id)}
          />
        </div>
      </div>
    </div>
  );
};
