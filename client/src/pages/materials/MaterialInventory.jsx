import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  History,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useMaterials, MATERIAL_CATEGORIES, TRANSACTION_TYPES } from '../../context/MaterialContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export default function MaterialInventory() {
  const { currentUser } = useAuth();
  const { materials, transactions, addMaterial, recordTransaction, getMaterialTransactions } = useMaterials();
  const { projects } = useProjects();

  // Filters
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Transaction Form State
  const [txType, setTxType] = useState(TRANSACTION_TYPES.ISSUED);
  const [txQuantity, setTxQuantity] = useState('');
  const [txRefNo, setTxRefNo] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [txError, setTxError] = useState('');
  const [txSuccess, setTxSuccess] = useState('');

  // Add Material Form State
  const initialAddForm = {
    name: '',
    category: MATERIAL_CATEGORIES[0],
    unit: 'Bags',
    currentStock: 100,
    minStock: 25,
    maxStock: 500,
    unitCost: 10.00,
    projectId: projects[0]?.id || '',
    supplier: ''
  };
  const [addForm, setAddForm] = useState(initialAddForm);

  // Filtered dataset
  const filteredMaterials = materials.filter((m) => {
    const matchesSite = selectedSiteFilter === 'ALL' || m.projectId === selectedSiteFilter;
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSite && matchesCat;
  });

  // Low stock items
  const lowStockItems = filteredMaterials.filter((m) => m.currentStock <= m.minStock);

  // Total valuation
  const totalValuation = filteredMaterials.reduce((acc, m) => acc + (m.currentStock * m.unitCost), 0);

  // Open Log Transaction Modal
  const openTxModal = (mat, defaultType = TRANSACTION_TYPES.ISSUED) => {
    setSelectedMaterial(mat);
    setTxType(defaultType);
    setTxQuantity('');
    setTxRefNo('');
    setTxNotes('');
    setTxError('');
    setTxSuccess('');
    setTxModalOpen(true);
  };

  // Submit Transaction
  const handleTxSubmit = (e) => {
    e.preventDefault();
    setTxError('');
    setTxSuccess('');

    try {
      const result = recordTransaction({
        materialId: selectedMaterial.id,
        type: txType,
        quantity: txQuantity,
        referenceNo: txRefNo,
        notes: txNotes,
        performedBy: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`
      });

      setTxSuccess(
        `Successfully logged ${txType} of ${txQuantity} ${selectedMaterial.unit}. New balance: ${result.newStock} ${selectedMaterial.unit}.`
      );
      setTxQuantity('');
      setTxNotes('');
      // Keep modal briefly to confirm or close
      setTimeout(() => {
        setTxModalOpen(false);
      }, 1500);
    } catch (err) {
      setTxError(err.message);
    }
  };

  // Open History Ledger Modal
  const openHistoryModal = (mat) => {
    setSelectedMaterial(mat);
    setHistoryModalOpen(true);
  };

  // Submit Add Material
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === addForm.projectId);

    addMaterial({
      ...addForm,
      projectName: proj ? proj.name : 'Central Warehouse'
    });

    setAddModalOpen(false);
    setAddForm(initialAddForm);
  };

  const columns = [
    {
      header: 'Material Name & Code',
      accessor: 'name',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.id}</span>
          <p style={{ fontWeight: 700, color: '#0f172a' }}>{row.name}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Supplier: {row.supplier}</span>
        </div>
      )
    },
    {
      header: 'Category & Site',
      accessor: 'category',
      render: (row) => (
        <div>
          <Badge status="ACTIVE" text={row.category} showDot={false} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
            <MapPin size={12} />
            <span>{row.projectName}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Stock Inventory',
      accessor: 'currentStock',
      render: (row) => {
        const isLow = row.currentStock <= row.minStock;
        const fillPercent = Math.min(Math.round((row.currentStock / row.maxStock) * 100), 100);

        return (
          <div style={{ minWidth: '160px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              <span style={{ color: isLow ? '#dc2626' : '#0f172a' }}>
                {row.currentStock.toLocaleString()} {row.unit}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Min: {row.minStock}
              </span>
            </div>
            {/* Visual Stock Level Bar */}
            <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${fillPercent}%`,
                  height: '100%',
                  backgroundColor: isLow ? '#dc2626' : '#059669',
                  borderRadius: '9999px'
                }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Stock Status',
      accessor: 'status',
      render: (row) => {
        if (row.currentStock === 0) return <Badge status="OUT_OF_STOCK" text="Stock Depleted" />;
        if (row.currentStock <= row.minStock) return <Badge status="LOW_STOCK" text="Low Stock Alert" />;
        return <Badge status="IN_STOCK" text="Adequate Stock" />;
      }
    },
    {
      header: 'Valuation',
      accessor: 'unitCost',
      render: (row) => (
        <div>
          <p style={{ fontWeight: 700, color: '#0f172a' }}>
            ₹{(row.currentStock * row.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>₹{row.unitCost.toFixed(2)} / {row.unit}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Button
            size="sm"
            variant="success"
            icon={ArrowDownLeft}
            onClick={() => openTxModal(row, TRANSACTION_TYPES.RECEIVED)}
            title="Receive Delivery from Vendor"
          >
            Receive
          </Button>

          <Button
            size="sm"
            variant="warning"
            icon={ArrowUpRight}
            onClick={() => openTxModal(row, TRANSACTION_TYPES.ISSUED)}
            title="Issue to Construction Site Crew"
          >
            Issue
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={History}
            onClick={() => openHistoryModal(row)}
            title="View Transaction Audit Ledger"
          />
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Package size={24} style={{ color: '#1e3a8a' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Materials Inventory & Warehouse Master
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Real-time multi-site stock accounting, receiving verification, material issuing, and negative-stock prevention.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="warning" icon={Plus} onClick={() => setAddModalOpen(true)}>
            Add Catalog Material
          </Button>
        </div>
      </div>

      {/* KPI Overview Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cataloged Items</span>
          <p style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{filteredMaterials.length}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all active sites</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: lowStockItems.length > 0 ? '#dc2626' : '#64748b', textTransform: 'uppercase' }}>Low Stock Warnings</span>
          <p style={{ fontSize: '1.65rem', fontWeight: 800, color: lowStockItems.length > 0 ? '#dc2626' : '#059669', marginTop: '0.2rem' }}>
            {lowStockItems.length}
          </p>
          <span style={{ fontSize: '0.75rem', color: lowStockItems.length > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
            {lowStockItems.length > 0 ? 'Requires Purchase Order' : 'All stocks adequate'}
          </span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Valuation</span>
          <p style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
            ₹{totalValuation.toLocaleString('en-IN')}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Warehouse asset value</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Ledger Logs</span>
          <p style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.2rem' }}>{transactions.length}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Audit-tracked transactions</span>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner (Section 15 Rule) */}
      {lowStockItems.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff7ed',
            border: '1px solid #ffedd5',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} style={{ color: '#ea580c', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#9a3412', fontSize: '0.9rem' }}>
                Low Inventory Threshold Warning ({lowStockItems.length} Materials Below Minimum Level)
              </strong>
              <p style={{ color: '#c2410c', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                {lowStockItems.map((m) => `${m.name} (${m.currentStock} ${m.unit})`).join(', ')}
              </p>
            </div>
          </div>
          <Button variant="warning" size="sm">
            Create Purchase Requisitions
          </Button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Site Selector + Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Site Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} style={{ color: '#1e3a8a' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Filter Site Warehouse:</span>
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff', color: '#0f172a' }}
            >
              <option value="ALL">All Project Sites</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
          <button
            onClick={() => setSelectedCategory('ALL')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: selectedCategory === 'ALL' ? '#1e3a8a' : '#ffffff',
              color: selectedCategory === 'ALL' ? '#ffffff' : '#64748b',
              border: '1px solid',
              borderColor: selectedCategory === 'ALL' ? '#1e3a8a' : '#cbd5e1',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Categories
          </button>
          {MATERIAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: selectedCategory === cat ? '#1e3a8a' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#1e3a8a' : '#cbd5e1',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table */}
      <Table
        title={`Inventory Ledger (${filteredMaterials.length})`}
        columns={columns}
        data={filteredMaterials}
        searchPlaceholder="Search material by name, category, or supplier..."
      />

      {/* Modal: Log Transaction (Receive, Issue, Return, Waste, Adjust) */}
      <Modal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        title={`Log Transaction: ${selectedMaterial?.name}`}
        subtitle={`Current Stock: ${selectedMaterial?.currentStock} ${selectedMaterial?.unit} • Warehouse: ${selectedMaterial?.projectName}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setTxModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleTxSubmit}>
              Confirm Transaction
            </Button>
          </>
        }
      >
        <form onSubmit={handleTxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {txError && (
            <div style={{ padding: '0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block' }}>Transaction Blocked (Non-Negative Stock Guard)</strong>
                <span>{txError}</span>
              </div>
            </div>
          )}

          {txSuccess && (
            <div style={{ padding: '0.85rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{txSuccess}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Transaction Action *
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value={TRANSACTION_TYPES.ISSUED}>📤 ISSUED (To Site Crew)</option>
                <option value={TRANSACTION_TYPES.RECEIVED}>📥 RECEIVED (From Vendor)</option>
                <option value={TRANSACTION_TYPES.PURCHASE}>🛒 PURCHASE (Direct Procurement)</option>
                <option value={TRANSACTION_TYPES.RETURNED}>🔄 RETURNED (Unused Back to Store)</option>
                <option value={TRANSACTION_TYPES.WASTED}>🗑️ WASTED (Damaged / Spoiled)</option>
                <option value={TRANSACTION_TYPES.ADJUSTED}>⚙️ ADJUSTED (Audit Reconciliation)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Quantity ({selectedMaterial?.unit}) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 50"
                value={txQuantity}
                onChange={(e) => setTxQuantity(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Reference / PO / Gate Pass No.
              </label>
              <input
                type="text"
                placeholder="e.g. GP-2026-8812"
                value={txRefNo}
                onChange={(e) => setTxRefNo(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Authorized Staff
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.role.replace('_', ' ')})`}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Transaction Purpose & Site Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Issued for 5th floor beam casting..."
              value={txNotes}
              onChange={(e) => setTxNotes(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Transaction History Audit Ledger */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Stock Transaction History: ${selectedMaterial?.name}`}
        subtitle={`Current Inventory: ${selectedMaterial?.currentStock} ${selectedMaterial?.unit} • Warehouse: ${selectedMaterial?.projectName}`}
        maxWidth="750px"
        footer={
          <Button variant="outline" onClick={() => setHistoryModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {selectedMaterial && getMaterialTransactions(selectedMaterial.id).length > 0 ? (
            getMaterialTransactions(selectedMaterial.id).map((tx) => (
              <div
                key={tx.id}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <Badge
                      status={
                        tx.type === 'RECEIVED' || tx.type === 'PURCHASE'
                          ? 'APPROVED'
                          : tx.type === 'WASTED'
                          ? 'REJECTED'
                          : 'PENDING'
                      }
                      text={tx.type}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{tx.referenceNo}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155' }}>{tx.notes}</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    By: {tx.performedBy} &bull; Date: {tx.date} at {tx.time}
                  </span>
                </div>

                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color:
                        tx.type === 'RECEIVED' || tx.type === 'PURCHASE' || tx.type === 'RETURNED'
                          ? '#059669'
                          : '#dc2626'
                    }}
                  >
                    {tx.type === 'RECEIVED' || tx.type === 'PURCHASE' || tx.type === 'RETURNED' ? '+' : '-'}
                    {tx.quantity} {selectedMaterial.unit}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                    Balance: <strong>{tx.balanceAfter} {selectedMaterial.unit}</strong>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No transactions recorded for this material item yet.
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Add Catalog Material */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Construction Material"
        subtitle="Catalog raw material, specify unit, and assign to site inventory"
        maxWidth="640px"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              Save Material
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
              Material Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ready-Mix Concrete Grade M25"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Category *
              </label>
              <select
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {MATERIAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Unit of Measurement *
              </label>
              <select
                value={addForm.unit}
                onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value="Bags">Bags</option>
                <option value="Tons">Tons</option>
                <option value="Cu. Meters">Cu. Meters</option>
                <option value="Meters">Meters</option>
                <option value="Units">Units (Pieces)</option>
                <option value="Boxes">Boxes</option>
                <option value="Litres">Litres</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Opening Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={addForm.currentStock}
                onChange={(e) => setAddForm({ ...addForm, currentStock: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Min Threshold *
              </label>
              <input
                type="number"
                required
                min="1"
                value={addForm.minStock}
                onChange={(e) => setAddForm({ ...addForm, minStock: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Unit Cost (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={addForm.unitCost}
                onChange={(e) => setAddForm({ ...addForm, unitCost: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Assign to Site Warehouse
              </label>
              <select
                value={addForm.projectId}
                onChange={(e) => setAddForm({ ...addForm, projectId: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Primary Supplier / Vendor
              </label>
              <input
                type="text"
                placeholder="e.g. Holcim Cement Ltd"
                value={addForm.supplier}
                onChange={(e) => setAddForm({ ...addForm, supplier: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
