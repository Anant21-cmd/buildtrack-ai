import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WorkerContext = createContext();

export const WORKER_STATUSES = {
  ACTIVE: 'ACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE'
};

export const TRADE_ROLES = [
  'General Labor',
  'Carpenter',
  'Electrician',
  'Plumber',
  'HVAC Technician',
  'Mason',
  'Welder',
  'Heavy Equipment Operator',
  'Site Supervisor',
  'Safety Officer'
];

export const CONTRACTOR_GROUPS = [
  'Internal Staff',
  'Apex Builders',
  'Metro Electrical',
  'City Plumbing',
  'Steel Works Inc'
];

export function WorkerProvider({ children }) {
  const [workers, setWorkers] = useState([]);
  const { currentUser, token } = useAuth();

  const fetchWorkers = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('/api/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setWorkers(data);
    } catch (err) {
      console.error('Failed to fetch workers', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) fetchWorkers();
  }, [currentUser, fetchWorkers]);

  const addWorker = async (workerData) => {
    const res = await fetch('/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(workerData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to add worker');
    fetchWorkers();
    return result;
  };

  const updateWorker = async (id, updatedData) => {
    const res = await fetch(`/api/workers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) fetchWorkers();
  };

  const assignWorkerToProject = async (workerId, projectId) => updateWorker(workerId, { projectId });

  return (
    <WorkerContext.Provider value={{ workers, addWorker, updateWorker, assignWorkerToProject, refreshData: fetchWorkers }}>
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorkers() {
  const context = useContext(WorkerContext);
  if (!context) throw new Error('useWorkers must be used within a WorkerProvider');
  return context;
}
