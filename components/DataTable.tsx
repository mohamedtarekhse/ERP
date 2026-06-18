import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';

export interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

export interface DataTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ title, columns, data, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="frappe-table-container">
      {/* List Filter Toolbar */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid var(--frappe-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'var(--frappe-bg)',
          borderRadius: '6px',
          padding: '4px 10px',
          flex: 1,
          maxWidth: '300px'
        }}>
          <Search size={14} color="var(--frappe-text-muted)" />
          <input 
            style={{ 
              border: 'none', 
              background: 'transparent', 
              outline: 'none', 
              fontSize: '13px',
              paddingLeft: '8px',
              width: '100%'
            }}
            placeholder={title ? `Search ${title}...` : "Filter..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button className="btn-frappe btn-frappe-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} /> 
          <span>Filter</span>
        </button>

        <div style={{ flex: 1 }} />
        
        <button className="icon-btn" title="Download">
          <Download size={16} />
        </button>
      </div>

      <table className="frappe-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr 
              key={row.id || idx} 
              style={{ cursor: 'pointer' }}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: 'var(--frappe-text-muted)' }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
