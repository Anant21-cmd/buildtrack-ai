import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import { useMaterials } from './MaterialContext';

const MaterialRequestContext = createContext();

export const REQUEST_STATUSES = {
  PENDING: 'PENDING',
  EXCESS_FLAGGED: 'EXCESS_FLAGGED',
  APPROVED: 'APPROVED',
  ISSUED: 'ISSUED',
  REJECTED: 'REJECTED'
};

export function MaterialRequestProvider({ children }) {
  const [requirements, setRequirements] = useState([]);
  const [requests, setRequests] = useState([]);
  const { currentUser, token } = useAuth();
  const { fetchMaterials } = useMaterials(); // To refresh stock after issuing

  const fetchRequirements = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch(`/api/material-requests/requirements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequirements(data);
    } catch (err) {
      console.error('Failed to fetch requirements', err);
    }
  }, [token, currentUser]);

  const fetchRequests = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch(`/api/material-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Map backend fields to frontend expected fields for seamless integration
        const mappedData = data.map(r => ({
          ...r,
          projectName: r.project?.name,
          materialName: r.material?.name,
          unit: r.material?.unit,
          requestedQuantity: r.qty,
          requestedAt: new Date(r.requestDate).toLocaleString('en-US')
        }));
        setRequests(mappedData);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) {
      fetchRequirements();
      fetchRequests();
    }
  }, [currentUser, fetchRequirements, fetchRequests]);

  const getRequirement = (projectId, materialId) => {
    const req = requirements.find((r) => r.projectId === projectId && r.materialId === materialId);
    if (!req) return null;
    return {
      approvedQuantity: req.allocatedQty,
      previouslyIssued: req.issuedQty
    };
  };

  const createMaterialRequest = async ({
    projectId,
    materialId,
    requestedQuantity,
    purpose,
    requestedBy
  }) => {
    try {
      const res = await fetch(`/api/material-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId, materialId, qty: Number(requestedQuantity), purpose, requestedBy })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create request');
      
      await fetchRequirements();
      await fetchRequests();
      
      return { request: data, isExcess: data.isExcess };
    } catch (err) {
      throw err;
    }
  };

  const approveStandardRequest = async (requestId, reviewerName) => {
    try {
      const res = await fetch(`/api/material-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewerName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to approve');
      await fetchRequests();
    } catch (err) {
      throw err;
    }
  };

  const approveExcessTrap = async (requestId, reviewerName, justificationReason) => {
    try {
      const res = await fetch(`/api/material-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewerName, justificationReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to approve excess trap');
      await fetchRequests();
    } catch (err) {
      throw err;
    }
  };

  const rejectRequest = async (requestId, reviewerName, reason) => {
    try {
      const res = await fetch(`/api/material-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewerName, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reject');
      await fetchRequests();
    } catch (err) {
      throw err;
    }
  };

  const issueMaterial = async (requestId, storeManagerName) => {
    try {
      const res = await fetch(`/api/material-requests/${requestId}/issue`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ storeManagerName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to issue material');
      
      await fetchRequirements();
      await fetchRequests();
      await fetchMaterials(); // Refresh global inventory stock
    } catch (err) {
      throw err;
    }
  };

  return (
    <MaterialRequestContext.Provider
      value={{
        requirements,
        requests,
        createMaterialRequest,
        approveStandardRequest,
        approveExcessTrap,
        rejectRequest,
        issueMaterial,
        getRequirement,
        REQUEST_STATUSES
      }}
    >
      {children}
    </MaterialRequestContext.Provider>
  );
}

export function useMaterialRequests() {
  const context = useContext(MaterialRequestContext);
  if (!context) {
    throw new Error('useMaterialRequests must be used within a MaterialRequestProvider');
  }
  return context;
}
