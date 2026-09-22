import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Save, Shield, Globe, Bell, Server } from 'lucide-react';

export default function GlobalSettings() {
  const [settings, setSettings] = useState({
    allowRegistration: true,
    maintenanceMode: false,
    enforce2FA: false,
    emailNotifications: true,
    systemLogLevel: 'info'
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // In a real app, this would hit a PUT /api/settings endpoint
    alert('System settings updated successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Platform Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Configure global variables and system-wide security policies.
          </p>
        </div>
        <Button onClick={handleSave} icon={Save}>Save Changes</Button>
      </div>

      <Card title="Security & Access">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <ToggleRow 
            icon={Globe}
            title="Allow New Company Registrations" 
            description="When disabled, new construction companies cannot sign up for the platform."
            active={settings.allowRegistration}
            onToggle={() => toggleSetting('allowRegistration')}
          />
          <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />
          <ToggleRow 
            icon={Shield}
            title="Enforce Two-Factor Authentication (2FA)" 
            description="Require all users to configure 2FA before accessing the dashboard."
            active={settings.enforce2FA}
            onToggle={() => toggleSetting('enforce2FA')}
          />
        </div>
      </Card>

      <Card title="System Maintenance">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <ToggleRow 
            icon={Server}
            title="Maintenance Mode" 
            description="Take the application offline for everyone except Super Admins."
            active={settings.maintenanceMode}
            onToggle={() => toggleSetting('maintenanceMode')}
            isDanger={true}
          />
          <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />
          <ToggleRow 
            icon={Bell}
            title="Global Email Notifications" 
            description="Enable or disable all outbound system emails (approvals, password resets)."
            active={settings.emailNotifications}
            onToggle={() => toggleSetting('emailNotifications')}
          />
        </div>
      </Card>
    </div>
  );
}

function ToggleRow({ icon: Icon, title, description, active, onToggle, isDanger }) {
  const toggleBg = active ? (isDanger ? '#dc2626' : '#2563eb') : '#cbd5e1';
  
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', height: 'fit-content' }}>
          <Icon size={20} />
        </div>
        <div>
          <h4 style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', margin: '0 0 0.25rem 0' }}>{title}</h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>{description}</p>
        </div>
      </div>
      
      {/* CSS Toggle Switch */}
      <div 
        onClick={onToggle}
        style={{
          width: '44px',
          height: '24px',
          backgroundColor: toggleBg,
          borderRadius: '12px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          flexShrink: 0
        }}
      >
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: active ? '22px' : '2px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  );
}

