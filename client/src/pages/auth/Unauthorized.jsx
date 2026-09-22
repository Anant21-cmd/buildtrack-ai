import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, RotateCcw } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, switchRole, ROLES } = useAuth();
  const attemptedPath = location.state?.attemptedPath || 'the requested page';

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #fee2e2',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.08)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#dc2626',
            backgroundColor: '#fee2e2',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px'
          }}
        >
          403 Forbidden &bull; Role Violation
        </span>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.75rem 0 0.5rem' }}>
          Access Restricted
        </h2>

        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Your active account (<strong>{currentUser?.name}</strong>, Role: <strong>{currentUser?.role?.replace('_', ' ')}</strong>) does not have sufficient administrative privileges to access <code>{attemptedPath}</code>.
        </p>

        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            fontSize: '0.825rem',
            color: '#475569'
          }}
        >
          <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem' }}>
            Role-Based Access Enforcement:
          </strong>
          Under BuildTrack security rules, platform-level governance is strictly reserved for <strong>Super Admin</strong>, and company resources are segregated by organization and operational role.
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/')}>
            Return to Allowed Dashboard
          </Button>

          {/* Quick tester helper */}
          <Button
            variant="primary"
            icon={RotateCcw}
            onClick={() => {
              switchRole(ROLES.SUPER_ADMIN);
              navigate(attemptedPath);
            }}
          >
            Switch to Super Admin
          </Button>
        </div>
      </div>
    </div>
  );
}

