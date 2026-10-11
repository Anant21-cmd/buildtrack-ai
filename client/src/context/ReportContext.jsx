import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ReportContext = createContext();

export function ReportProvider({ children }) {
  const { token, currentUser } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [photos, setPhotos] = useState([]);
  
  const fetchReports = useCallback(async (projectId) => {
    if (!token) return;
    try {
      const url = projectId ? `/api/reports?projectId=${projectId}` : '/api/reports';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  }, [token]);

  const fetchPhotos = useCallback(async (projectId) => {
    if (!token) return;
    try {
      const url = projectId ? `/api/reports/photos?projectId=${projectId}` : '/api/reports/photos';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Failed to fetch photos', err);
    }
  }, [token]);

  // Initial load of all company reports
  useEffect(() => {
    if (token) {
      fetchReports();
      fetchPhotos();
    }
  }, [token, fetchReports, fetchPhotos]);

  const addReport = async (reportData) => {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });
    if (res.ok) {
      fetchReports();
    } else {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add report');
    }
  };

  const addPhoto = async (photoData) => {
    const res = await fetch('/api/reports/photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(photoData)
    });
    if (res.ok) {
      fetchPhotos();
    } else {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add photo');
    }
  };

  const deletePhoto = async (id) => {
    try {
      const res = await fetch(`/api/reports/photos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <ReportContext.Provider value={{ reports, fetchReports, addReport, photos, fetchPhotos, addPhoto, deletePhoto }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
}
