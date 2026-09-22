import React, { useState } from 'react';
import { Search, Inbox } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKey = '',
  title,
  actions,
  emptyMessage = 'No records found.'
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (searchKey && item[searchKey]) {
      return String(item[searchKey]).toLowerCase().includes(term);
    }
    // Search across all string/number fields
    return Object.values(item).some((val) =>
      val !== null && val !== undefined && String(val).toLowerCase().includes(term)
    );
  });

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header bar with title, search, and action buttons */}
      {(title || searchable || actions) && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: '#ffffff'
          }}
        >
          <div>
            {title && (
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                {title}
              </h4>
            )}
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing {filteredData.length} of {data.length} total entries
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {searchable && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  minWidth: '240px'
                }}
              >
                <Search size={16} style={{ color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '0.875rem',
                    width: '100%',
                    color: '#0f172a'
                  }}
                />
              </div>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Table Element */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.875rem'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '0.85rem 1.25rem',
                    fontWeight: 700,
                    color: '#475569',
                    fontSize: '0.775rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    ...col.headerStyle
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.15s ease'
                  }}
                  className="table-row-hover"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '1rem 1.25rem',
                        color: '#1e293b',
                        verticalAlign: 'middle',
                        ...col.cellStyle
                      }}
                    >
                      {col.render ? col.render(row, rIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    color: '#94a3b8'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Inbox size={36} style={{ strokeWidth: 1.5, color: '#cbd5e1' }} />
                    <p style={{ fontWeight: 500, color: '#64748b' }}>{emptyMessage}</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        style={{ fontSize: '0.8rem', color: '#1e3a8a', textDecoration: 'underline' }}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

