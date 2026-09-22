import React, { useState } from 'react';
import { Shield, Search, Filter, Clock, User, FileText } from 'lucide-react';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { useCompany } from '../../context/CompanyContext';

export default function AuditLogsView() {
  const { auditLogs } = useCompany();
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem' }}>
          <Clock size={14} />
          <span>{row.timestamp}</span>
        </div>
      )
    },
    {
      header: 'Actor & Role',
      accessor: 'actorName',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: '#0f172a' }}>
            <User size={14} style={{ color: '#1e3a8a' }} />
            <span>{row.actorName}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.actorRole}</span>
        </div>
      )
    },
    {
      header: 'Action Taken',
      accessor: 'action',
      render: (row) => {
        const isApproved = row.action.includes('APPROVED');
        const isRejected = row.action.includes('REJECTED');
        const isSuspended = row.action.includes('SUSPENDED');
        return (
          <Badge
            status={isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : isSuspended ? 'SUSPENDED' : 'ACTIVE'}
            text={row.action.replace('_', ' ')}
            showDot={true}
          />
        );
      }
    },
    {
      header: 'Target Entity',
      accessor: 'entityId',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.entity}</span>
          <p style={{ fontWeight: 600, color: '#1e293b' }}>{row.entityId}</p>
        </div>
      )
    },
    {
      header: 'State Delta',
      accessor: 'newValue',
      render: (row) => (
        <div style={{ fontSize: '0.8rem' }}>
          <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>{row.previousValue}</span>
          <span style={{ color: '#64748b', margin: '0 0.35rem' }}>➔</span>
          <strong style={{ color: '#0f172a' }}>{row.newValue}</strong>
        </div>
      )
    },
    {
      header: 'Justification / Reason',
      accessor: 'reason',
      render: (row) => (
        <p style={{ fontSize: '0.825rem', color: '#475569', maxWidth: '300px' }}>
          {row.reason}
        </p>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Shield size={24} style={{ color: '#1e3a8a' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            System Audit & Governance Trail
          </h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Immutable records of company approvals, rejections, material excess authorisations, and critical security events.
        </p>
      </div>

      {/* Action Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Filter Action:</span>
        {['ALL', 'COMPANY_APPROVED', 'COMPANY_REJECTED', 'COMPANY_SUSPENDED', 'COMPANY_REGISTERED'].map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: filterAction === act ? '#1e3a8a' : '#ffffff',
              color: filterAction === act ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: filterAction === act ? '#1e3a8a' : '#cbd5e1'
            }}
          >
            {act.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <Table
        title="Audit Log Records"
        columns={columns}
        data={filteredLogs}
        searchPlaceholder="Search audit events by actor, company, action, or reason..."
      />
    </div>
  );
}

