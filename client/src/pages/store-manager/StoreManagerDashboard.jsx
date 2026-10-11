import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaterialRequests, REQUEST_STATUSES } from '../../context/MaterialRequestContext';
import { useMaterials } from '../../context/MaterialContext';
import { Package, ShieldAlert, CheckCircle2, AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StoreManagerDashboard() {
  const { currentUser } = useAuth();
  const { requests } = useMaterialRequests();
  const { materials } = useMaterials();
  const navigate = useNavigate();

  const pendingRequests = requests.filter(r => r.status === REQUEST_STATUSES.PENDING);
  const excessRequests = requests.filter(r => r.status === REQUEST_STATUSES.EXCESS_FLAGGED);
  const readyToIssue = requests.filter(r => r.status === REQUEST_STATUSES.APPROVED);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            Store Manager Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Welcome back, {currentUser?.name}. Manage inventory, issuances, and WhatsApp material requests.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '50%' }}>
            <Bell size={24} color="#d97706" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Pending Requests</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{pendingRequests.length}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '50%' }}>
            <ShieldAlert size={24} color="#dc2626" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Over-Quota Flags</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{excessRequests.length}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '50%' }}>
            <CheckCircle2 size={24} color="#059669" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Ready to Issue</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{readyToIssue.length}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '50%' }}>
            <Package size={24} color="#2563eb" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Total Materials</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{materials.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#3b82f6" /> Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/materials/requests')}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#1e3a8a', color: '#fff', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Review Material Requests
          </button>
          <button 
            onClick={() => navigate('/materials')}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '6px', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          >
            Manage Inventory
          </button>
        </div>
      </div>
    </div>
  );
}

