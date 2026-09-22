import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { useAuth, ROLES } from '../../context/AuthContext';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

export default function TeamManagement() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.SITE_ENGINEER
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        alert('Invitation sent successfully! Check backend logs for the Ethereal link.');
        setShowModal(false);
        setFormData({ name: '', email: '', role: ROLES.SITE_ENGINEER });
        fetchUsers();
      } else {
        alert(data.message || 'Failed to send invite');
      }
    } catch (err) {
      alert('Network error sending invite');
    } finally {
      setInviting(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (row) => row.role.replace('_', ' ')
    },
    { 
      header: 'Status', 
      accessor: 'isEmailVerified',
      render: (row) => row.isEmailVerified ? (
        <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
          <CheckCircle size={16} /> Verified
        </span>
      ) : (
        <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
          <Mail size={16} /> Pending Verification
        </span>
      )
    }
  ];

  const availableRoles = [
    { value: ROLES.SITE_ENGINEER, label: 'Site Engineer' },
    { value: ROLES.STORE_MANAGER, label: 'Store Manager' },
    { value: ROLES.CONTRACTOR, label: 'Contractor' },
    { value: ROLES.CLIENT, label: 'Client' },
    { value: ROLES.COMPANY_ADMIN, label: 'Company Admin' }
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Team & Access Management</h1>
        <Button onClick={() => setShowModal(true)}>+ Invite Team Member</Button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <Card style={{ width: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Invite to Platform</h2>
              <XCircle size={24} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Platform Role</label>
                <select 
                  required
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                  {availableRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button type="submit" disabled={inviting} style={{ flex: 1 }}>
                  {inviting ? 'Sending...' : 'Send Invite'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading team members...</div>
        ) : (
          <Table columns={columns} data={users} />
        )}
      </Card>
    </div>
  );
}

