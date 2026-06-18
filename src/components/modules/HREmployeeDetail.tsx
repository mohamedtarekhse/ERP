import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '../../store/globalStore';
import { useEmployee, useCreateEmployee, useDepartments, useDesignations } from '../../hooks/useHR';
import { ObjectPage } from '../ObjectPage';
import { Calendar, Briefcase, FileText } from 'lucide-react';

export const HREmployeeDetail: React.FC = () => {
  const { t } = useTranslation();
  const { activeRecordId, closeObjectPage } = useGlobalStore();
  
  const isNew = activeRecordId === 'New';
  const { data: employee, isLoading: isEmployeeLoading } = useEmployee(!isNew ? activeRecordId : null);
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { mutate: createEmployee } = useCreateEmployee();

  const [formData, setFormData] = useState<any>({
    first_name: '',
    last_name: '',
    department_id: '',
    designation_id: '',
    status: 'Probation',
    company_email: '',
    cell_number: '',
    branch: '',
    employment_type: 'Full-time',
    crew_type: 'Onshore',
    date_of_joining: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleSave = () => {
    if (isNew) {
      createEmployee(formData, {
        onSuccess: () => closeObjectPage()
      });
    } else {
      // Implement update mutation
      console.log('Update not yet implemented');
      closeObjectPage();
    }
  };

  if (activeRecordId && !isNew && isEmployeeLoading) {
    return <div className="loading-state">Loading Employee Profile...</div>;
  }

  const InfoTab = (
    <div className="detail-grid">
      <div className="field-group">
        <label>{t('hr.first_name')}</label>
        <input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
      </div>
      <div className="field-group">
        <label>{t('hr.last_name')}</label>
        <input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
      </div>
      <div className="field-group">
        <label>{t('hr.department')}</label>
        <select value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
          <option value="">Select Department</option>
          {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div className="field-group">
        <label>{t('hr.designation')}</label>
        <select value={formData.designation_id} onChange={e => setFormData({...formData, designation_id: e.target.value})}>
          <option value="">Select Designation</option>
          {designations?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div className="field-group">
        <label>Email</label>
        <input value={formData.company_email} onChange={e => setFormData({...formData, company_email: e.target.value})} />
      </div>
      <div className="field-group">
        <label>Phone</label>
        <input value={formData.cell_number} onChange={e => setFormData({...formData, cell_number: e.target.value})} />
      </div>
      <div className="field-group">
        <label>Branch / Site</label>
        <input value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
      </div>
      <div className="field-group">
        <label>Joining Date</label>
        <input type="date" value={formData.date_of_joining} onChange={e => setFormData({...formData, date_of_joining: e.target.value})} />
      </div>
    </div>
  );

  const LeaveTab = (
    <div className="tab-container">
      <h3>Leave Balances</h3>
      <div className="balance-grid">
        {employee?.leave_allocations?.map((la: any) => (
          <div key={la.id} className="balance-card">
            <span className="balance-label">{la.leave_type_id}</span>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${(la.total_leaves_allocated / 30) * 100}%` }}></div>
            </div>
            <span className="balance-value">{la.total_leaves_allocated} Days</span>
          </div>
        ))}
      </div>
    </div>
  );

  const HistoryTab = (
    <div className="timeline">
      {employee?.employee_internal_work_history?.sort((a: any, b: any) => new Date(b.from_date).getTime() - new Date(a.from_date).getTime()).map((h: any) => (
        <div key={h.id} className="timeline-item">
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <div className="timeline-date">{h.from_date} - {h.to_date || 'Present'}</div>
            <div className="timeline-title">Designation Changed to {h.designation_id}</div>
          </div>
        </div>
      ))}
      {!employee?.employee_internal_work_history?.length && <p>No history available.</p>}
    </div>
  );

  const tabs = [
    { id: 'info', label: 'General Info', icon: <Briefcase size={16} />, component: InfoTab }
  ];

  if (!isNew && employee) {
    tabs.push({ id: 'leave', label: 'Leave', icon: <Calendar size={16} />, component: LeaveTab });
    tabs.push({ id: 'history', label: 'History', icon: <FileText size={16} />, component: HistoryTab });
  }

  return (
    <ObjectPage 
      title={isNew ? t('hr.new_employee') : `${formData.first_name} ${formData.last_name}`}
      subtitle={designations?.find((d: any) => d.id === formData.designation_id)?.name || formData.name}
      statusBadge={{ 
        text: formData.status, 
        state: formData.status === 'Active' ? 'Success' : formData.status === 'On Leave' ? 'Warning' : 'Information' 
      }}
      tabs={tabs}
      onSave={handleSave}
      isNew={isNew}
    />
  );
};
