import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  onNewRecord?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ title, columns, data, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div style={styles.container}>
      {/* Smart Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterRow}>
          <div style={styles.searchGroup}>
            <Search size={16} color="var(--sap-text-muted)" />
            <input 
              style={styles.searchInput}
              placeholder={`Search ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={styles.filterBtn}><Filter size={16} /> Filters</button>
          <div style={{ flex: 1 }} />
          <button style={styles.iconBtn} title="Export"><Download size={16} /></button>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={styles.th}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr 
                key={row.id || idx} 
                style={styles.tr} 
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map(col => (
                  <td key={col.key} style={styles.td}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{...styles.td, textAlign: 'center', padding: '32px' }}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--sap-white)',
    border: '1px solid var(--sap-border)',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  filterBar: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--sap-border)',
    backgroundColor: '#f7f7f7'
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  searchGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--sap-white)',
    border: '1px solid var(--sap-border)',
    borderRadius: '3px',
    padding: '4px 8px',
    width: '300px'
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--sap-white)',
    border: '1px solid var(--sap-border)',
    borderRadius: '3px',
    padding: '4px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    color: 'var(--sap-text)'
  },
  titleArea: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--sap-text)'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  searchBox: {
    border: '1px solid var(--sap-border)',
    borderRadius: '4px',
    padding: '4px 8px',
    marginRight: '8px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px'
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid var(--sap-border)',
    borderRadius: '4px',
    padding: '6px',
    cursor: 'pointer',
    color: 'var(--sap-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryBtn: {
    backgroundColor: 'var(--sap-blue)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '8px'
  },
  tableWrapper: {
    flex: 1,
    overflowY: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px'
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '1px solid var(--sap-border)',
    color: 'var(--sap-text-muted)',
    fontWeight: 400,
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--sap-white)',
    zIndex: 10
  },
  tr: {
    borderBottom: '1px solid var(--sap-border)',
    cursor: 'pointer'
  },
  td: {
    padding: '12px 16px',
    color: 'var(--sap-text)'
  }
};
