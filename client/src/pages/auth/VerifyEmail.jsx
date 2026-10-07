import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import '../../App.css'; // Inherit premium styles

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setMessage('Invalid verification link. Missing token or email.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/users/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token })
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email has been successfully verified.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be expired or invalid.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('A network error occurred while verifying your email.');
      }
    };

    verify();
  }, [email, token]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div className="premium-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        
        {status === 'verifying' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem' }}>Verifying Email...</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Please wait while we verify your secure credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem' }}>Email Verified!</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>{message}</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem', fontStyle: 'italic' }}>Note: Your company still requires Super Admin approval before you can access the dashboard.</p>
            <Link to="/login" className="premium-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Proceed to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem' }}>Verification Failed</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>{message}</p>
            <Link to="/login" className="premium-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
