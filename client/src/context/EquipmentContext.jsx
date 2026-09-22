import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const EquipmentContext = createContext();
export const useEquipment = () => useContext(EquipmentContext);

export const EquipmentProvider = ({ children }) => {
  const [equipment, setEquipment] = useState([]);
  const { currentUser, token } = useAuth();

  const fetchEquipment = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('http://localhost:5000/api/equipment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setEquipment(data);
    } catch (err) {
      console.error('Failed to fetch equipment', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) fetchEquipment();
  }, [currentUser, fetchEquipment]);


  const addEquipment = async (eq) => {
    const res = await fetch('http://localhost:5000/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(eq)
    });
    if (res.ok) fetchEquipment();
  };

  const updateEquipmentStatus = async (id, status, projectId = null) => {
    const res = await fetch(`http://localhost:5000/api/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, projectId: status === 'In Use' ? projectId : undefined })
    });
    if (res.ok) fetchEquipment();
  };


  return (
    <EquipmentContext.Provider value={{ equipment, addEquipment, updateEquipmentStatus }}>
      {children}
    </EquipmentContext.Provider>
  );
};
