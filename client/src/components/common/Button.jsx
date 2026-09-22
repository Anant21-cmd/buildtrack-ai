import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  style = {},
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: '1px solid #0f172a'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#334155',
          border: '1px solid #cbd5e1'
        };
      case 'danger':
        return {
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: '1px solid #dc2626'
        };
      case 'success':
        return {
          backgroundColor: '#059669',
          color: '#ffffff',
          border: '1px solid #059669'
        };
      case 'warning':
        return {
          backgroundColor: '#d97706',
          color: '#ffffff',
          border: '1px solid #d97706'
        };
      case 'primary':
      default:
        return {
          backgroundColor: '#1e3a8a',
          color: '#ffffff',
          border: '1px solid #1e3a8a'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' };
      case 'lg':
        return { padding: '0.75rem 1.5rem', fontSize: '1rem', gap: '0.65rem' };
      case 'md':
      default:
        return { padding: '0.55rem 1.1rem', fontSize: '0.875rem', gap: '0.5rem' };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        borderRadius: '6px',
        transition: 'all 0.15s ease',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.65 : 1,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      className={`btn-custom ${className}`}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" style={{
          width: '14px',
          height: '14px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

