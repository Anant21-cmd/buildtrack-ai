import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { HardHat, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../../components/common/Button';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle, verifyOtp, ROLES } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const redirectPath = location.state?.from?.pathname === '/' ? '/dashboard' : (location.state?.from?.pathname || '/dashboard');

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMessage('');
    setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      if (data.user.role === ROLES.SUPER_ADMIN) {
        navigate('/super-admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      if (data.requiresVerification) {
        setOtpMode(true);
        setSuccessMessage(data.message);
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (data.role === ROLES.SUPER_ADMIN) {
        navigate('/super-admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const user = await verifyOtp(email, otpCode);
      if (user.role === ROLES.SUPER_ADMIN) {
        navigate('/super-admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick preset loader for presentation convenience
  const fillPreset = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setErrorMessage('');
    setOtpMode(false);
    setOtpCode('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div style={{ maxWidth: '460px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              marginBottom: '0.75rem'
            }}
          >
            <HardHat size={30} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
            BUILDTRACK <span style={{ color: '#f59e0b' }}>AI</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Smart Construction Site Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Account Sign In
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
              Enter your corporate credentials to access your site portal.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #ef4444' }}>
              <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#b91c1c', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #10b981' }}>
              <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#047857', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>{successMessage}</p>
            </div>
          )}

          {otpMode ? (
            <form onSubmit={handleOtpVerify}>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#475569', fontSize: '0.9rem' }}>We sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your identity.</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Verification Code
                </label>
                <div style={{ position: 'relative' }}>
                  <Shield size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.2rem', letterSpacing: '0.2em', textAlign: 'center', outline: 'none', transition: 'all 0.2s', backgroundColor: '#f8fafc', color: '#0f172a' }}
                  />
                </div>
              </div>

              <Button type="submit" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                 <button type="button" onClick={() => setOtpMode(false)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem' }}>Back to login</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Work Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    placeholder="engineer@apex.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#f8fafc', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                  <span>Password</span>
                  <a href="#" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>Forgot?</a>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', backgroundColor: '#f8fafc', color: '#0f172a' }}
                  />
                </div>
              </div>

              <Button type="submit" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In securely'}
              </Button>
            </form>
          )}

          {/* Google SSO Divider */}
          <div style={{ position: 'relative', margin: '1.5rem 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #e2e8f0' }} />
            <span style={{ position: 'relative', backgroundColor: '#ffffff', padding: '0 0.75rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
              OR
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMessage('Google Single Sign-On Failed')}
              useOneTap
            />
          </div>

          {/* New Company Registration Link */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              New construction company?{' '}
            </span>
            <Link to="/register-company" style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 700 }}>
              Register for Platform Verification &rarr;
            </Link>
          </div>
        </div>

        {/* Demo Fast Login Area */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
            Testing / Fast Access Presets
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {DEMO_USERS.map((user, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => fillPreset(user)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
              >
                {user.label}
              </button>
            ))}
          </div>
      </div>
    </div>
    </div>
  );
}
