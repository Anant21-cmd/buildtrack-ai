import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Save, 
  Mail, 
  Phone, 
  Lock,
  Moon,
  Smartphone
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';

export default function CompanySettings() {
  const { currentUser, updateUserProfile, changeUserPassword, token } = useAuth();
  const { updateCurrentCompany } = useCompany();
  
  const isAdmin = currentUser?.role === ROLES.COMPANY_ADMIN || currentUser?.role === ROLES.SUPER_ADMIN;
  
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null); // { type: 'success'|'error', text: '' }

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    smsAlerts: false,
    darkMode: false,
    weeklyReport: true
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: currentUser?.company?.name || '',
    regNumber: currentUser?.company?.regNumber || '',
    billingAddress: currentUser?.company?.address || '',
    phone: currentUser?.company?.phone || ''
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyFeedback, setCompanyFeedback] = useState(null);

  // Sync forms whenever currentUser is updated
  React.useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
      if (currentUser.company) {
        setCompanyForm({
          companyName: currentUser.company.name || '',
          regNumber: currentUser.company.regNumber || '',
          billingAddress: currentUser.company.address || '',
          phone: currentUser.company.phone || ''
        });
      }
    }
  }, [currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback(null);
    try {
      await updateUserProfile({
        name: profileForm.name,
        phone: profileForm.phone
      });
      setProfileFeedback({ type: 'success', text: 'Profile and phone number updated successfully!' });
      setTimeout(() => setProfileFeedback(null), 4000);
    } catch (err) {
      setProfileFeedback({ type: 'error', text: err.message || 'Failed to update profile' });
      setTimeout(() => setProfileFeedback(null), 4000);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordFeedback({ type: 'error', text: 'New password and confirm password do not match' });
      return;
    }
    setUpdatingPassword(true);
    setPasswordFeedback(null);
    try {
      await changeUserPassword(passwordForm.current, passwordForm.new);
      setPasswordFeedback({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordFeedback(null), 4000);
    } catch (err) {
      setPasswordFeedback({ type: 'error', text: err.message || 'Failed to change password' });
      setTimeout(() => setPasswordFeedback(null), 4000);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleCompanySave = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    setCompanyFeedback(null);
    try {
      await updateCurrentCompany({
        name: companyForm.companyName,
        regNumber: companyForm.regNumber,
        address: companyForm.billingAddress,
        phone: companyForm.phone
      });
      setCompanyFeedback({ type: 'success', text: 'Company details updated successfully!' });
      setTimeout(() => setCompanyFeedback(null), 4000);
    } catch (err) {
      setCompanyFeedback({ type: 'error', text: err.message || 'Failed to update company details' });
      setTimeout(() => setCompanyFeedback(null), 4000);
    } finally {
      setSavingCompany(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={28} style={{ color: '#3b82f6' }} />
            Account Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Manage your personal profile, notification preferences, and security.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', mdGridTemplateColumns: '250px 1fr', gap: '1.5rem' }}>
        
        {/* Settings Sidebar Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <TabButton 
            active={activeTab === 'PROFILE'} 
            onClick={() => setActiveTab('PROFILE')} 
            icon={User} 
            label="My Profile" 
          />
          <TabButton 
            active={activeTab === 'SECURITY'} 
            onClick={() => setActiveTab('SECURITY')} 
            icon={Shield} 
            label="Security" 
          />
          <TabButton 
            active={activeTab === 'NOTIFICATIONS'} 
            onClick={() => setActiveTab('NOTIFICATIONS')} 
            icon={Bell} 
            label="Preferences" 
          />
          {isAdmin && (
            <TabButton 
              active={activeTab === 'COMPANY'} 
              onClick={() => setActiveTab('COMPANY')} 
              icon={Building2} 
              label="Company Details" 
            />
          )}
        </div>

        {/* Settings Content Area */}
        <div style={{ padding: '0.5rem 0' }}>
          
          {/* PROFILE TAB */}
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  Personal Information
                </h3>

                {profileFeedback && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    marginBottom: '1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: profileFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: profileFeedback.type === 'success' ? '#047857' : '#b91c1c',
                    border: `1px solid ${profileFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {profileFeedback.text}
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', 
                    backgroundColor: '#1e3a8a', color: '#fff', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '2rem', fontWeight: 700 
                  }}>
                    {profileForm.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <Button variant="outline" type="button" size="sm">Change Avatar</Button>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text" 
                        value={profileForm.name} 
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.25rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="email" 
                        value={profileForm.email} 
                        disabled
                        style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.25rem', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', outline: 'none' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Contact system admin to change email.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="tel" 
                        value={profileForm.phone} 
                        placeholder="e.g. +91 98765 43210"
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        style={{ width: '100%', padding: '0.65rem 0.65rem 0.65rem 2.25rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>System Role</label>
                    <input 
                      type="text" 
                      value={currentUser?.role ? currentUser.role.replace('_', ' ') : 'N/A'} 
                      disabled
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', outline: 'none', fontWeight: 700 }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="primary" type="submit" icon={Save} disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </Card>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'SECURITY' && (
            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={18} style={{ color: '#3b82f6' }} /> Change Password
                </h3>

                {passwordFeedback && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    marginBottom: '1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: passwordFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: passwordFeedback.type === 'success' ? '#047857' : '#b91c1c',
                    border: `1px solid ${passwordFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {passwordFeedback.text}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', maxWidth: '500px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.current} 
                      onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                      style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.new} 
                      onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                      style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.confirm} 
                      onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem' }}>
                  <Button variant="primary" type="submit" icon={Save} disabled={updatingPassword}>
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </Card>
            </form>
          )}

          {/* NOTIFICATIONS & PREFERENCES TAB */}
          {activeTab === 'NOTIFICATIONS' && (
            <Card>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: '#3b82f6' }} /> Notification Preferences
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '0.95rem' }}>Email Notifications</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Receive daily summaries and critical alerts via email.</p>
                  </div>
                  <ToggleSwitch checked={preferences.emailAlerts} onChange={() => setPreferences({...preferences, emailAlerts: !preferences.emailAlerts})} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '0.95rem' }}>SMS Alerts</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Get text messages for high-severity safety incidents.</p>
                  </div>
                  <ToggleSwitch checked={preferences.smsAlerts} onChange={() => setPreferences({...preferences, smsAlerts: !preferences.smsAlerts})} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '0.95rem' }}>Weekly Progress Report</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Receive an automated site progress PDF every Friday.</p>
                  </div>
                  <ToggleSwitch checked={preferences.weeklyReport} onChange={() => setPreferences({...preferences, weeklyReport: !preferences.weeklyReport})} />
                </div>

              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Moon size={18} style={{ color: '#3b82f6' }} /> Display Preferences
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '0.95rem' }}>Dark Mode</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Switch the application theme to dark mode (coming soon).</p>
                </div>
                <ToggleSwitch checked={preferences.darkMode} onChange={() => setPreferences({...preferences, darkMode: !preferences.darkMode})} disabled />
              </div>

            </Card>
          )}

          {/* COMPANY DETAILS TAB (Admins Only) */}
          {activeTab === 'COMPANY' && isAdmin && (
            <form onSubmit={handleCompanySave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Card>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={18} style={{ color: '#3b82f6' }} /> Master Company Details
                </h3>

                {companyFeedback && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    marginBottom: '1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: companyFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: companyFeedback.type === 'success' ? '#047857' : '#b91c1c',
                    border: `1px solid ${companyFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {companyFeedback.text}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Registered Company Name</label>
                    <input 
                      type="text" 
                      value={companyForm.companyName} 
                      onChange={e => setCompanyForm({...companyForm, companyName: e.target.value})}
                      style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Registration / Tax ID (CRN)</label>
                    <input 
                      type="text" 
                      value={companyForm.regNumber} 
                      onChange={e => setCompanyForm({...companyForm, regNumber: e.target.value})}
                      style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Corporate Billing Address</label>
                    <textarea 
                      rows={2}
                      value={companyForm.billingAddress} 
                      onChange={e => setCompanyForm({...companyForm, billingAddress: e.target.value})}
                      style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '1.5rem' }}>
                  <Button variant="primary" type="submit" icon={Save} disabled={savingCompany}>
                    {savingCompany ? 'Saving...' : 'Save Company Profile'}
                  </Button>
                </div>
              </Card>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

// Sub-components

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        border: 'none',
        backgroundColor: active ? '#1e3a8a' : 'transparent',
        color: active ? '#fff' : '#64748b',
        fontWeight: active ? 700 : 500,
        fontSize: '0.9rem',
        borderRadius: '999px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        outline: 'none'
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <div 
      onClick={disabled ? null : onChange}
      style={{ 
        width: '44px', height: '24px', 
        backgroundColor: checked ? '#10b981' : '#cbd5e1', 
        borderRadius: '999px', 
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <div style={{ 
        width: '20px', height: '20px', 
        backgroundColor: '#fff', 
        borderRadius: '50%', 
        position: 'absolute', 
        top: '2px', 
        left: checked ? '22px' : '2px',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </div>
  );
}
