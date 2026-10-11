import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const InspectionContext = createContext();

export function InspectionProvider({ children }) {
  const { token, currentUser } = useAuth();
  const [inspections, setInspections] = useState([]);

  const fetchInspections = useCallback(async (projectId) => {
    if (!token) return;
    try {
      const url = projectId ? `/api/inspections?projectId=${projectId}` : '/api/inspections';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInspections(data.inspections);
      }
    } catch (err) {
      console.error('Failed to fetch inspections', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchInspections();
    }
  }, [token, fetchInspections]);

  const addInspection = async (inspectionData) => {
    const res = await fetch('/api/inspections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(inspectionData)
    });
    if (res.ok) {
      if (inspectionData.projectId) {
        fetchInspections(inspectionData.projectId);
      } else {
        fetchInspections();
      }
    } else {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add inspection');
    }
  };

  const updateInspection = async (id, updateData) => {
    const res = await fetch(`/api/inspections/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    if (res.ok) {
      fetchInspections(); // reload all to be safe
    } else {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update inspection');
    }
  };

  return (
    <InspectionContext.Provider value={{ inspections, fetchInspections, addInspection, updateInspection }}>
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspections() {
  const context = useContext(InspectionContext);
  if (!context) throw new Error('useInspections must be used within an InspectionProvider');
  return context;
}

