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
    if (!token || (!currentUser?.companyId && currentUser?.role !== 'SUPER_ADMIN')) return;
    try {
      const res = await fetch(`/api/material-requests/requirements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRequirements(data);
        fetchRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch requirements', err);
    }
  }, [token, currentUser]);

  const fetchRequests = useCallback(async (currentReqs) => {
    if (!token || (!currentUser?.companyId && currentUser?.role !== 'SUPER_ADMIN')) return;
    try {
      const res = await fetch(`/api/material-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const reqList = currentReqs || requirements || [];
        // Map backend fields to frontend expected fields for seamless integration
        const mappedData = data.map(r => {
          const req = reqList.find(q => q.projectId === r.projectId && q.materialId === r.materialId);
          const approvedQuota = req ? req.allocatedQty : (r.approvedQuota || 500);
          const previouslyIssued = req ? req.issuedQty : (r.previouslyIssued || 0);
          const remainingQuota = Math.max(0, approvedQuota - previouslyIssued);
          const isExcess = r.qty > remainingQuota;
          const excessQuantity = isExcess ? r.qty - remainingQuota : 0;
          const excessHist = r.histories?.find(h => (h.remarks || '').toLowerCase().includes('excess'));
          const rejectHist = r.histories?.find(h => h.status === 'Rejected');

          return {
            ...r,
            projectName: r.project?.name || r.projectName,
            materialName: r.material?.name || r.materialName,
            unit: r.material?.unit || r.unit || 'Units',
            requestedQuantity: r.qty,
            purpose: r.reason || r.purpose || 'Site Requirement',
            approvedQuota,
            previouslyIssued,
            remainingQuota,
            isExcess,
            excessQuantity,
            excessJustification: r.excessJustification || excessHist?.remarks,
            excessApprovedBy: r.excessApprovedBy || excessHist?.changedById || 'Management',
            rejectionReason: r.rejectionReason || rejectHist?.remarks,
            requestedAt: new Date(r.requestDate).toLocaleString('en-US')
          };
        });
        setRequests(mappedData);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  }, [token, currentUser, requirements]);

  useEffect(() => {
    if (currentUser?.companyId || currentUser?.role === 'SUPER_ADMIN') {
      fetchRequirements();
      fetchRequests();
    }
  }, [currentUser]);

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
    requestedBy,
    recipientPhone
  }) => {
    try {
      const res = await fetch(`/api/material-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId, materialId, qty: Number(requestedQuantity), purpose, requestedBy, recipientPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create request');
      
      await fetchRequirements();
      await fetchRequests();
      
      const record = data.record || data;
      return { request: record, isExcess: record.isExcess, whatsapp: data.whatsapp };
    } catch (err) {
      throw err;
    }
  };

  const updateRequestStatus = async (requestId, status, remarks) => {
    try {
      const res = await fetch(`/api/material-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, remarks })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      
      await fetchRequirements();
      await fetchRequests();
      await fetchMaterials();
      return data;
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
        updateRequestStatus,
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
