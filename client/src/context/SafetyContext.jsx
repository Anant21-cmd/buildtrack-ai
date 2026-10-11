import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SafetyContext = createContext();

export function SafetyProvider({ children }) {
  const { token, currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = useCallback(async (projectId) => {
    if (!token) return;
    try {
      const url = projectId ? `/api/safety?projectId=${projectId}` : '/api/safety';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch safety incidents', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchIncidents();
    }
  }, [token, fetchIncidents]);

  const addIncident = async (incidentData) => {
    const res = await fetch('/api/safety', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(incidentData)
    });
    if (res.ok) {
      if (incidentData.projectId) {
        fetchIncidents(incidentData.projectId);
      } else {
        fetchIncidents();
      }
    } else {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add incident');
    }
  };

  const updateIncident = async (id, updateData) => {
    const res = await fetch(`/api/safety/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    if (res.ok) {
      fetchIncidents();
    } else {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update incident');
    }
  };

  return (
    <SafetyContext.Provider value={{ incidents, fetchIncidents, addIncident, updateIncident }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) throw new Error('useSafety must be used within a SafetyProvider');
  return context;
}

