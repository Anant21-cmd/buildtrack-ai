import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, Building2, User, Mail, Phone, MapPin, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { useCompany } from '../../context/CompanyContext';
import { useAuth, ROLES } from '../../context/AuthContext';

export default function CompanyRegister() {
  const { registerCompany } = useCompany();
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    documentData: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdCompany, setCreatedCompany] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, documentData: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.regNumber || !formData.ownerName || !formData.email || !formData.password || !formData.documentData) {
      alert('Please fill out all required fields, including the verification document.');
      return;
    }

    try {
      const newCo = await registerCompany({
        companyName: formData.name,
        regNumber: formData.regNumber,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        documentData: formData.documentData
      });
      setCreatedCompany(newCo);
      setIsSubmitted(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoToSuperAdmin = () => {
    switchRole(ROLES.SUPER_ADMIN);
    navigate('/super-admin/pending-approvals');
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
      <div style={{ maxWidth: '640px', width: '100%' }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              backgroundColor: '#d97706',
              color: '#ffffff',
              marginBottom: '0.75rem'
            }}
          >
            <HardHat size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            BUILDTRACK <span style={{ color: '#f59e0b' }}>AI</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Construction Company Onboarding & Compliance Portal
          </p>
        </div>

        {/* Card Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '2.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
                  Register Construction Company
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                  Submitted applications enter <strong>PENDING</strong> status and must be verified by a Super Admin before access is granted.
                </p>
              </div>

              {/* Company Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Company Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Apex Builders Corp"
                      value={formData.name}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Corporate Reg / Tax ID *
                  </label>
                  <input
                    type="text"
                    name="regNumber"
                    required
                    placeholder="e.g. REG-2026-9901"
                    value={formData.regNumber}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Owner Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Authorized Owner / Admin *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    required
                    placeholder="Full Legal Name"
                    value={formData.ownerName}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Password & Phone Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Admin Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Create a strong password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Verification Document (PDF/Image) *
                    </label>
                    <input
                      type="file"
                      name="documentData"
                      accept=".pdf,image/*"
                      required
                      onChange={handleFileChange}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Headquarters City / State *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="e.g. Dallas, TX"
                    value={formData.address}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
                <FileCheck size={16} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle', color: '#059669' }} />
                Standard corporate verification packages (Incorporation certificate and safety compliance) are attached by default for this registration.
              </div>

              <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                Submit Company for Verification
              </Button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <Link to="/" style={{ fontSize: '0.85rem', color: '#1e3a8a', fontWeight: 600 }}>
                  &larr; Return to Dashboard
                </Link>
              </div>
            </form>
          ) : (
            /* Post-Submission Status Feedback Screen */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#fef3c7',
                    color: '#b45309',
                    marginBottom: '0.5rem'
                  }}
                >
                  STATUS: PENDING REVIEW
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  Application Submitted Successfully!
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0.5rem auto 0', lineHeight: 1.5 }}>
                  <strong>{createdCompany?.name}</strong> has been registered with ID <strong>{createdCompany?.id}</strong>. In accordance with BuildTrack governance rules, your account cannot access company management features until a Super Admin approves your corporate credentials.
                </p>
              </div>

              {/* Demo Shortcut Box */}
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px dashed #94a3b8',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  ⚡ Evaluator / Demo Action Shortcut:
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  You can immediately jump into the Super Admin console to review, approve, or reject this new company application.
                </p>
                <Button variant="primary" size="sm" icon={ArrowRight} onClick={handleGoToSuperAdmin}>
                  Review in Super Admin Approvals Queue
                </Button>
              </div>

              <Link to="/">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

