import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, ROLES } from './AuthContext';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const { currentUser, token } = useAuth();

  const fetchCompanies = useCallback(async () => {
    if (!token || currentUser?.role !== ROLES.SUPER_ADMIN) return;
    try {
      const res = await fetch('http://localhost:5000/api/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch companies', err);
    }
  }, [token, currentUser]);

  const fetchAuditLogs = useCallback(async () => {
    if (!token || currentUser?.role !== ROLES.SUPER_ADMIN) return;
    try {
      const res = await fetch('http://localhost:5000/api/companies/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAuditLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.role === ROLES.SUPER_ADMIN) {
      fetchCompanies();
      fetchAuditLogs();
    }
  }, [currentUser, fetchCompanies, fetchAuditLogs]);

  // Register a new company (Public)
  const registerCompany = async (data) => {
    const res = await fetch('http://localhost:5000/api/companies/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Registration failed');
    return result.company;
  };

  // Super Admin approves company
  const approveCompany = async (companyId) => {
    const res = await fetch(`http://localhost:5000/api/companies/${companyId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (res.ok) {
      fetchCompanies();
      fetchAuditLogs();
    }
    return result;
  };

  // Super Admin rejects company
  const rejectCompany = async (companyId, reason) => {
    const res = await fetch(`http://localhost:5000/api/companies/${companyId}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason })
    });
    const result = await res.json();
    if (res.ok) {
      fetchCompanies();
      fetchAuditLogs();
    }
    return result;
  };

  // Suspend company (Not built on backend yet, placeholder)
  const suspendCompany = async (companyId, reason) => {
    alert("Suspend not implemented in API yet");
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        auditLogs,
        registerCompany,
        approveCompany,
        rejectCompany,
        suspendCompany,
        refreshData: () => { fetchCompanies(); fetchAuditLogs(); }
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
