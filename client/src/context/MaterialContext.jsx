import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const MaterialContext = createContext();

export const MATERIAL_CATEGORIES = [
  'Concrete & Masonry',
  'Steel & Metals',
  'Lumber & Wood',
  'Plumbing & Piping',
  'Electrical & Wiring',
  'Interior Finishes (Paint, Flooring)',
  'Roofing & Insulation',
  'Consumable Tools'
];

export const TRANSACTION_TYPES = {
  ISSUED: 'ISSUED',
  RECEIVED: 'RECEIVED',
  PURCHASE: 'PURCHASE',
  RETURNED: 'RETURNED',
  WASTED: 'WASTED',
  ADJUSTED: 'ADJUSTED'
};

export function MaterialProvider({ children }) {
  const [materials, setMaterials] = useState([]);
  const { currentUser, token } = useAuth();

  const fetchMaterials = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('/api/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMaterials(data);
    } catch (err) {
      console.error('Failed to fetch materials', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) fetchMaterials();
  }, [currentUser, fetchMaterials]);

  const addMaterial = async (materialData) => {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(materialData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to add material');
    fetchMaterials();
    return result;
  };

  const updateMaterial = async (id, updatedData) => {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) fetchMaterials();
  };

  // Deplete stock
  const deductStock = async (id, amount) => {
    const mat = materials.find((m) => m.id === id);
    if (!mat) throw new Error('Material not found');
    if (mat.stockLevel < amount) throw new Error(`Insufficient stock for ${mat.name}`);
    await updateMaterial(id, { stockLevel: mat.stockLevel - amount });
  };

  // Add stock
  const receiveStock = async (id, amount) => {
    const mat = materials.find((m) => m.id === id);
    if (!mat) throw new Error('Material not found');
    await updateMaterial(id, { stockLevel: mat.stockLevel + amount });
  };

  const getMaterial = (id) => materials.find((m) => m.id === id);

  // MOCK TRANSACTIONS FOR UI PRESENTATION
  const [transactions, setTransactions] = useState([]);
  const recordTransaction = (tx) => {
    setTransactions(prev => [{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], time: '10:00 AM', ...tx }, ...prev]);
    if (tx.type === 'RECEIVED' || tx.type === 'PURCHASE' || tx.type === 'RETURNED') receiveStock(tx.materialId, tx.quantity);
    else deductStock(tx.materialId, tx.quantity);
  };
  const getMaterialTransactions = (id) => transactions.filter(t => t.materialId === id);

  return (
    <MaterialContext.Provider value={{
      materials,
      transactions,
      addMaterial,
      updateMaterial,
      deductStock,
      receiveStock,
      getMaterial,
      recordTransaction,
      getMaterialTransactions,
      refreshData: fetchMaterials
    }}>
      {children}
    </MaterialContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialContext);
  if (!context) throw new Error('useMaterials must be used within a MaterialProvider');
  return context;
}
