import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { Search, Mail, Building2, User, UserCircle } from 'lucide-react';

export default function PlatformUsers() {
  const { token, currentUser, ROLES } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === ROLES.SUPER_ADMIN || currentUser?.role === 'SUPER_ADMIN') {
      fetchUsers();
    }
  }, [token, currentUser, ROLES]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Platform Users
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage all registered user accounts across the entire platform.
          </p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name, email, or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>User Profile</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Organization</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Joined Date</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No users found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 600 }}>
                          {user.avatar || <UserCircle size={20} />}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>{user.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge status={user.role.includes('ADMIN') ? 'ACTIVE' : 'IN_PROGRESS'} text={user.role.replace('_', ' ')} />
                    </td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={14} color="#94a3b8" />
                        {user.company?.name || <span style={{ color: '#cbd5e1' }}>System Level</span>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#475569' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', color: '#3b82f6', fontWeight: 500 }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

