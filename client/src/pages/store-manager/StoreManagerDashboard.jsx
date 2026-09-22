import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Package, Truck, AlertOctagon, ArrowRight } from 'lucide-react';
import { useMaterials } from '../../context/MaterialContext';
import { useMaterialRequests } from '../../context/MaterialRequestContext';

export default function StoreManagerDashboard() {
  const { materials } = useMaterials();
  const { requests } = useMaterialRequests();

  // Low stock
  const lowStockCount = materials.filter(m => m.currentStock <= (m.minimumStock || 10)).length;
  
  // Pending requests
  const pendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'EXCESS_FLAGGED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Store Manager Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Inventory, equipment checkout, and material request overview.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard title="Low Stock Alerts" value={lowStockCount.toString()} icon={AlertOctagon} color={lowStockCount > 0 ? '#dc2626' : '#16a34a'} />
        <MetricCard title="Pending POs" value="0" icon={Truck} color="#2563eb" />
        <MetricCard title="Total Materials" value={materials.length.toString()} icon={Package} color="#ca8a04" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card title="Material Requests (Needs Approval)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {pendingRequests.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No pending requests.</p>
            ) : (
              pendingRequests.slice(0,5).map(r => (
                <RequestRow key={r.id} item={r.material?.name || 'Unknown Item'} qty={r.requestedQty} site={r.project?.name || 'Unknown Site'} status={r.status} />
              ))
            )}
          </div>
        </Card>

        <Card title="Equipment Tracking">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <EqptRow item="Excavator EX-01" status="IN_USE" assignedTo="John Doe" />
            <EqptRow item="Concrete Mixer CM-02" status="MAINTENANCE" assignedTo="Workshop" />
            <EqptRow item="Generator GEN-01" status="AVAILABLE" assignedTo="Yard" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: `${color}15`, color: color }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{title}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{value}</h3>
      </div>
    </div>
  );
}

function RequestRow({ item, qty, site, status }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '0.9rem' }}>{item}</h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{site} • {qty} Units</p>
      </div>
      {status === 'EXCESS_FLAGGED' ? (
        <Badge status="EXCESS_FLAGGED" />
      ) : (
        <button style={{ alignSelf: 'center', padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Review</button>
      )}
    </div>
  );
}

function EqptRow({ item, status, assignedTo }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '0.85rem' }}>{item}</h4>
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{assignedTo}</span>
      </div>
      <Badge status={status} />
    </div>
  );
}
