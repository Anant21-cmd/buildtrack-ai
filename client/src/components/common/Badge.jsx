import React from 'react';

const STATUS_CONFIGS = {
  // General & Company Statuses
  PENDING: { label: 'Pending', bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  APPROVED: { label: 'Approved', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  REJECTED: { label: 'Rejected', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  SUSPENDED: { label: 'Suspended', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  
  // Project & Task Statuses
  PLANNING: { label: 'Planning', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  ACTIVE: { label: 'Active', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  IN_PROGRESS: { label: 'In Progress', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  ON_HOLD: { label: 'On Hold', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  COMPLETED: { label: 'Completed', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  DELAYED: { label: 'Delayed', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  CANCELLED: { label: 'Cancelled', bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
  
  // Materials & Excess
  EXCESS_FLAGGED: { label: 'Excess Alert', bg: '#fef2f2', text: '#dc2626', border: '#f87171' },
  LOW_STOCK: { label: 'Low Stock', bg: '#fff7ed', text: '#c2410c', border: '#fdba74' },
  IN_STOCK: { label: 'In Stock', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  
  // Attendance & Priorities
  PRESENT: { label: 'Present', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  ABSENT: { label: 'Absent', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  CRITICAL: { label: 'Critical', bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' },
  HIGH: { label: 'High', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  MEDIUM: { label: 'Medium', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  LOW: { label: 'Low', bg: '#f8fafc', text: '#475569', border: '#e2e8f0' }
};

export default function Badge({ status = 'ACTIVE', text, showDot = true, style = {} }) {
  const normalizedKey = String(status).toUpperCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: text || status,
    bg: '#f1f5f9',
    text: '#334155',
    border: '#cbd5e1'
  };

  const displayText = text || config.label;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.6rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
        ...style
      }}
    >
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.text
          }}
        />
      )}
      <span>{displayText}</span>
    </span>
  );
}

