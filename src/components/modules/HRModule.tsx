import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployees, useHRKPIs } from '../../hooks/useHR';
import { DataTable } from '../DataTable';
import { useGlobalStore } from '../../store/globalStore';
import { Users, UserPlus, Clock, CheckCircle } from 'lucide-react';

const KPICard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
  <div className="kpi-card">
    <div className="kpi-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="kpi-content">
      <span className="kpi-title">{title}</span>
      <span className="kpi-value">{value}</span>
    </div>
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
        <span className={`status-pill status-${row.status?.toLowerCase().replace(' ', '-')}`}>
          {row.status}
        </span>
      )
    }
  ];

  if (employeesLoading || kpisLoading) {
    return <div className="loading-state">Loading HR Module...</div>;
  }

  return (
    <div className="module-container">
      {/* KPI Row */}
      <div className="kpi-row">
        <KPICard 
          title="Total Headcount" 
          value={kpis?.total_headcount || 0} 
          icon={<Users size={24} />} 
          color="var(--sap-blue)" 
        />
        <KPICard 
          title="Active Employees" 
          value={kpis?.active_count || 0} 
          icon={<CheckCircle size={24} />} 
          color="var(--sap-green)" 
        />
        <KPICard 
          title="Field Crew" 
          value={kpis?.field_crew_count || 0} 
          icon={<Users size={24} />} 
          color="var(--sap-purple)" 
        />
        <KPICard 
          title="Pending Leaves" 
          value={kpis?.pending_leaves || 0} 
          icon={<Clock size={24} />} 
          color="var(--sap-orange)" 
        />
      </div>

      {/* Main Content: Master-Detail */}
      <div className="module-content">
        <div className="content-header">
          <h2>{t('nav.hr')} ({employees?.length || 0})</h2>
          <button className="btn-primary" onClick={() => openObjectPage('Employee', 'New Employee')}>
            <UserPlus size={16} />
            <span>{t('hr.new_employee') || 'New Employee'}</span>
          </button>
        </div>
        
        <DataTable 
          title="Employees"
          columns={columns} 
          data={employees || []} 
          onRowClick={(row) => openObjectPage('Employee', row.id)}
        />
      </div>
    </div>
  );
};
