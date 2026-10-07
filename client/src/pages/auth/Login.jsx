import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { HardHat, Lock, Mail, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle, ROLES } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Vanta.js 3D WebGL Background
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    let effect;
    const initVanta = () => {
      if (window.VANTA && !effect) {
        effect = window.VANTA.NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xea580c,      // Kreo Orange
          backgroundColor: 0x050505, // Deep Black
          points: 12.00,        // Density of points
          maxDistance: 22.00,   // Connection distance
          spacing: 18.00,       // Spread
          showDots: true
        });
        setVantaEffect(effect);
      }
    };
    
    // Slight delay to ensure the CDN scripts have loaded
    const timeout = setTimeout(initVanta, 100);

    return () => {
      clearTimeout(timeout);
      if (effect) effect.destroy();
    };
  }, []);

  const redirectPath = location.state?.from?.pathname === '/' ? '/dashboard' : (location.state?.from?.pathname || '/dashboard');

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMessage(''); setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      if (data.user.role === ROLES.SUPER_ADMIN) navigate('/super-admin/dashboard');
      else navigate(redirectPath);
    } catch (err) { setErrorMessage(err.message); } 
    finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setErrorMessage(''); setLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      if (user.role === ROLES.SUPER_ADMIN) navigate('/super-admin/dashboard');
      else navigate(redirectPath);
    } catch (err) { setErrorMessage(err.message); } 
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault(); setErrorMessage(''); setSuccessMessage(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) setSuccessMessage(data.message);
      else setErrorMessage(data.message || 'Failed to send reset email');
    } catch (err) { setErrorMessage('A network error occurred. Please try again.'); } 
    finally { setLoading(false); }
  };

  
  const styleSheet = `
    .premium-bg {
      position: relative; 
      overflow: hidden; 
      min-height: 100vh; 
      display: flex;
      font-family: 'Inter', -apple-system, sans-serif;
    }

    /* Minimalist Matte Card over WebGL */
    .premium-card {
      position: relative; z-index: 10;
      background: rgba(10, 10, 10, 0.7); /* Translucent */
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1); 
      border-radius: 16px;
      padding: 3rem 2.5rem; width: 100%; max-width: 420px;
      box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 1);
      animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes slideUp {
      0% { opacity: 0; transform: translateY(30px) scale(0.97); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Input Styling - Solid Dark Background */
    .premium-input {
      width: 100%; padding: 0.875rem 1rem 0.875rem 3rem; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1); background: #111111; font-size: 0.95rem; color: #ffffff;
      transition: all 0.3s ease; outline: none;
    }
    
    /* Fix for Chrome's awful white autofill background */
    .premium-input:-webkit-autofill,
    .premium-input:-webkit-autofill:hover, 
    .premium-input:-webkit-autofill:focus, 
    .premium-input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #111111 inset !important;
        -webkit-text-fill-color: #ffffff !important;
        transition: background-color 5000s ease-in-out 0s;
    }

    .premium-input:focus {
      border-color: #ea580c; 
      background: #1a1a1a;
      box-shadow: 0 0 0 1px #ea580c;
    }
    
    /* Input Icon Styling */
    .premium-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #64748b; transition: color 0.3s; z-index: 5; }
    .premium-input-group:focus-within .premium-icon { color: #ea580c; }

    /* Button Styling - Kreo Orange instead of White */
    .premium-btn {
      background: #ea580c; color: #ffffff;
      font-weight: 700; font-size: 0.95rem; border: none; border-radius: 8px;
      padding: 1rem; width: 100%; cursor: pointer; position: relative;
      transition: all 0.2s ease;
    }
    .premium-btn:hover:not(:disabled) { 
      background: #c2410c; color: #ffffff; 
      box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4);
    }
    .premium-btn:active:not(:disabled) { transform: translateY(1px); }
  `;

  return (
    <>
      <style>{styleSheet}</style>
      <div className="premium-bg" ref={vantaRef}>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', zIndex: 10 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ backgroundColor: '#ea580c', padding: '0.6rem', borderRadius: '10px', boxShadow: '0 8px 20px rgba(234,88,12,0.4)' }}>
              <HardHat color="#ffffff" size={30} />
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '2px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
              KREO
            </span>
          </div>

          <div className="premium-card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem', textAlign: 'center' }}>
              {forgotPasswordMode ? 'Reset Password' : 'Log in to Kreo'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2.5rem', textAlign: 'center' }}>
              {forgotPasswordMode ? 'Enter your email to receive a secure reset link.' : 'Enter your credentials to access the platform.'}
            </p>

            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{errorMessage}</p>
              </div>
            )}
            
            {successMessage && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0 }} />
                <p style={{ color: '#22c55e', fontSize: '0.85rem', margin: 0 }}>{successMessage}</p>
              </div>
            )}

            {forgotPasswordMode ? (
              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.5rem' }}>Work Email</label>
                  <div className="premium-input-group" style={{ position: 'relative' }}>
                    <Mail size={18} className="premium-icon" />
                    <input type="email" required placeholder="engineer@kreo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="premium-input" />
                  </div>
                </div>
                <button type="submit" className="premium-btn" disabled={loading}>
                  {loading ? 'Transmitting...' : 'Send Reset Link'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                   <button type="button" onClick={() => { setForgotPasswordMode(false); setSuccessMessage(''); setErrorMessage(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', transition: 'color 0.2s' }} onMouseOver={(e)=>e.target.style.color='#ffffff'} onMouseOut={(e)=>e.target.style.color='#64748b'}>&larr; Back to login</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.5rem' }}>Work Email</label>
                  <div className="premium-input-group" style={{ position: 'relative' }}>
                    <Mail size={18} className="premium-icon" />
                    <input type="email" required placeholder="engineer@kreo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="premium-input" />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.5rem' }}>
                    <span>Password</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); setForgotPasswordMode(true); setErrorMessage(''); }} style={{ color: '#ea580c', textDecoration: 'none' }} onMouseOver={(e)=>e.target.style.color='#ff7e36'} onMouseOut={(e)=>e.target.style.color='#ea580c'}>Forgot?</a>
                  </label>
                  <div className="premium-input-group" style={{ position: 'relative' }}>
                    <Lock size={18} className="premium-icon" />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="premium-input" style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="premium-btn" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            )}

            <div style={{ position: 'relative', margin: '2rem 0', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
              <span style={{ position: 'relative', background: 'transparent', padding: '0 1rem', color: '#475569', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>OR</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setErrorMessage('Google SSO Failed')} useOneTap theme="filled_black" />
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>New company? </span>
              <Link to="/register-company" style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>Apply for Access &rarr;</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}



