import React, { useState } from 'react';
import { useVendors } from '../../context/VendorContext';
import { useMaterials } from '../../context/MaterialContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

const MaterialReceiving = () => {
  const { purchaseOrders, receivings, receiveMaterial } = useVendors();
  const { materials } = useMaterials();
  const { currentUser } = useAuth();
  
  const [selectedPO, setSelectedPO] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [orderedQty, setOrderedQty] = useState('');
  const [deliveredQty, setDeliveredQty] = useState('');
  const [notes, setNotes] = useState('');

  // Get active POs (Draft/Pending Delivery)
  const activePOs = purchaseOrders.filter(po => po.status !== 'COMPLETED' && po.status !== 'CANCELLED');

  const handleReceive = async (e) => {
    e.preventDefault();
    if (!selectedPO || !selectedMaterial || !orderedQty || !deliveredQty) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      await receiveMaterial({
        poId: selectedPO,
        materialId: selectedMaterial,
        orderedQty: Number(orderedQty),
        deliveredQty: Number(deliveredQty),
        receivedBy: currentUser?.name || 'Store Manager',
        mismatchReason: notes.trim()
      });
      setSelectedPO('');
      setSelectedMaterial('');
      setOrderedQty('');
      setDeliveredQty('');
      setNotes('');
      alert("Receipt successfully logged!");
    } catch (err) {
      alert(err.message || 'Error logging receipt');
    }
  };

  const columns = [
    { header: 'Date', accessor: 'dateReceived', render: (row) => new Date(row.dateReceived).toLocaleDateString() },
    { header: 'PO Ref', accessor: 'poId', render: (row) => row.purchaseOrder?.poNumber || row.poId.substring(0, 8) },
    { header: 'Material', accessor: 'materialId', render: (row) => row.material?.name || 'Unknown' },
    { header: 'Ordered', accessor: 'orderedQty', render: (row) => <span style={{color: '#64748b'}}>{row.orderedQty}</span> },
    { 
      header: 'Delivered', 
      accessor: 'deliveredQty',
      render: (row) => (
        <span style={{ fontWeight: 700, color: row.isMismatch ? '#dc2626' : '#059669' }}>
          {row.deliveredQty}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <Badge variant={row.status === 'MISMATCH_FLAGGED' ? 'danger' : 'success'}>{row.status.replace('_', ' ')}</Badge>
    },
    { header: 'Notes', accessor: 'mismatchReason' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Material Receiving (GRN)</h1>
          <p className="page-subtitle">Verify deliveries, flag shortages/excesses, and update inventory</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <Card title="Log New Delivery (GRN)">
          {activePOs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No active Purchase Orders found.</p>
          ) : (
            <form onSubmit={handleReceive} className="form-layout">
              <div className="form-group">
                <label>Select Purchase Order</label>
                <select className="form-input" required value={selectedPO} onChange={e => setSelectedPO(e.target.value)}>
                  <option value="">-- Choose PO --</option>
                  {activePOs.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber || `PO-${po.id.substring(0,6)}`} - {po.vendor?.name} (₹{po.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Delivered Material</label>
                <select className="form-input" required value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)}>
                  <option value="">-- Choose Material --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.category}) - Stock: {m.stock} {m.unit}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Ordered Qty</label>
                  <input type="number" step="0.01" className="form-input" required value={orderedQty} onChange={e => setOrderedQty(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Delivered Qty</label>
                  <input type="number" step="0.01" className="form-input" required value={deliveredQty} onChange={e => setDeliveredQty(e.target.value)} />
                </div>
              </div>
              
              {Number(orderedQty) > 0 && Number(deliveredQty) !== Number(orderedQty) && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600, margin: 0 }}>
                    ⚠️ Mismatch Detected: {Number(deliveredQty) < Number(orderedQty) ? 'Shortage' : 'Excess'} of {Math.abs(Number(deliveredQty) - Number(orderedQty))} units.
                  </p>
                </div>
              )}

              <div className="form-group">
                <label>Verification Notes / Mismatch Reason</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder={Number(deliveredQty) !== Number(orderedQty) ? "Required: Explain the mismatch..." : "Optional delivery notes..."}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  required={Number(orderedQty) > 0 && Number(deliveredQty) !== Number(orderedQty)}
                />
              </div>
              <Button type="submit" style={{ width: '100%' }}>Verify & Update Inventory</Button>
            </form>
          )}
        </Card>

        <Card title="Recent Receiving Logs (GRN History)">
          <Table columns={columns} data={receivings || []} />
        </Card>
      </div>
    </div>
  );
};

export default MaterialReceiving;
