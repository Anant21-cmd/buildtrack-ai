import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HardHat, Lock, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';

export default function SetupAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to setup account');
      }
    } catch (err) {
      setError('An error occurred while setting up your account');
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <p>Invalid setup link. Missing token or email.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f8fafc' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#1e3a8a', padding: '0.5rem', borderRadius: '8px' }}>
            <HardHat color="#ffffff" size={28} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.5px' }}>
            KREO
          </span>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Account Verified!</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your password has been set successfully.</p>
              <Button variant="primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Complete Account Setup</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Create a password for <strong>{email}</strong></p>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '4px' }}>
                  <p style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Min 6 characters" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Confirm your password" />
                  </div>
                </div>

                <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                  {loading ? 'Saving...' : 'Set Password & Verify'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
