import React from 'react';

export default function Card({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = '#eff6ff',
  iconColor = '#1e3a8a',
  trend,
  trendPositive = true,
  children,
  onClick,
  style = {},
  className = ''
}) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      className={`dashboard-card ${className}`}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          {title && (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {title}
            </span>
          )}
          {value !== undefined && (
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {value}
            </h3>
          )}
        </div>

        {Icon && (
          <div
            style={{
              padding: '0.65rem',
              borderRadius: '8px',
              backgroundColor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {subtitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          {trend && (
            <span style={{
              fontWeight: 700,
              color: trendPositive ? '#059669' : '#dc2626'
            }}>
              {trendPositive ? '▲' : '▼'} {trend}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}

      {children}
    </div>
  );
}

