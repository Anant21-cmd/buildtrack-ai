import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const VendorContext = createContext();

export const VENDOR_CATEGORIES = {
  MATERIALS: 'Raw Materials & Supplies',
  EQUIPMENT: 'Equipment & Machinery',
  SUBCONTRACTOR: 'Subcontractor / Labor',
  SERVICES: 'Site Services (Waste, Temp Power)',
  SOFTWARE: 'Software & Technology'
};

export const VENDOR_STATUSES = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING_REVIEW',
  INACTIVE: 'INACTIVE',
  BLACKLISTED: 'BLACKLISTED'
};

export function VendorProvider({ children }) {
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [receivings, setReceivings] = useState([]);
  const { currentUser, token } = useAuth();

  const fetchReceivings = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('/api/purchase-orders/receipts/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setReceivings(data);
    } catch (err) {
      console.error('Failed to fetch receivings', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) {
      fetchReceivings();
    }
  }, [currentUser, fetchReceivings]);

  const receiveMaterial = async (data) => {
    const res = await fetch(`/api/purchase-orders/${data.poId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to receive material');
    fetchReceivings();
    fetchPurchaseOrders();
    return result;
  };

  const fetchVendors = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('/api/vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setVendors(data);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    }
  }, [token, currentUser]);

  const fetchPurchaseOrders = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('/api/purchase-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPurchaseOrders(data);
    } catch (err) {
      console.error('Failed to fetch POs', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) {
      fetchVendors();
      fetchPurchaseOrders();
    }
  }, [currentUser, fetchVendors, fetchPurchaseOrders]);

  const addVendor = async (vendorData) => {
    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(vendorData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to add vendor');
    fetchVendors();
    return result;
  };

  const updateVendor = async (id, updatedData) => {
    const res = await fetch(`/api/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) fetchVendors();
  };

  const getVendor = (id) => vendors.find((v) => v.id === id);

  const addPurchaseOrder = async (poData) => {
    const res = await fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(poData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to add PO');
    fetchPurchaseOrders();
    return result;
  };

  const updatePOStatus = async (id, status) => {
    const res = await fetch(`/api/purchase-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchPurchaseOrders();
  };

  return (
    <VendorContext.Provider value={{
      vendors,
      purchaseOrders,
      addVendor,
      updateVendor,
      getVendor,
      addPurchaseOrder,
      updatePOStatus,
      receivings,
      receiveMaterial,
      refreshData: () => { fetchVendors(); fetchPurchaseOrders(); }
    }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendors() {
  const context = useContext(VendorContext);
  if (!context) throw new Error('useVendors must be used within a VendorProvider');
  return context;
}
