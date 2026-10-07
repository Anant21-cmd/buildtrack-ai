import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import Badge from '../common/Badge';

export default function Navbar({ onMenuToggle }) {
  const { currentUser, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      {/* Left: Mobile Toggle & Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuToggle}
          style={{
            padding: '0.4rem',
            borderRadius: '6px',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="mobile-menu-trigger"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Organization
          </span>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
            {currentUser?.company?.name || 'Kreo Platform HQ'}
          </h2>
        </div>
      </div>

      {/* Right: Notifications, User Card & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Notifications Icon */}
        <button
          style={{
            position: 'relative',
            padding: '0.5rem',
            borderRadius: '8px',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="icon-btn"
          aria-label="Notifications"
        >
          <Bell size={18} />
          
        </button>

        {/* User Card */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #e2e8f0'
              }}
            >
              {currentUser.avatar}
            </div>
            <div className="user-text-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {currentUser.name}
              </span>
              <Badge
                status={currentUser.role}
                text={currentUser.role.replace('_', ' ')}
                showDot={false}
                style={{ padding: '0.05rem 0.4rem', fontSize: '0.65rem' }}
              />
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Sign out of current session"
        >
          <LogOut size={16} />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
}


