import React, { useState } from 'react';
import {
  HardHat,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  Plus,
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

export default function ComponentShowcase() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Sample data for the Table component demonstration
  const sampleProjects = [
    { id: 'PRJ-101', name: 'Skyline Heights Tower A', client: 'Sterling Group', budget: '$4,200,000', progress: '68%', status: 'ACTIVE' },
    { id: 'PRJ-102', name: 'Metro Line 4 Extension', client: 'City Transit Dept', budget: '$12,500,000', progress: '34%', status: 'IN_PROGRESS' },
    { id: 'PRJ-103', name: 'Harbor Commercial Hub', client: 'Pacific Realty', budget: '$8,900,000', progress: '12%', status: 'PLANNING' },
    { id: 'PRJ-104', name: 'Greenfield Logistics Park', client: 'Apex Warehousing', budget: '$3,100,000', progress: '85%', status: 'ON_HOLD' },
    { id: 'PRJ-105', name: 'Oakridge Residential Villas', client: 'Oakridge Estates', budget: '$2,750,000', progress: '100%', status: 'COMPLETED' },
    { id: 'PRJ-106', name: 'Riverview Medical Complex', client: 'HealthCore Hospital', budget: '$15,000,000', progress: '45%', status: 'DELAYED' }
  ];

  const columns = [
    {
      header: 'Project Code & Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.id}</span>
          <p style={{ fontWeight: 600, color: '#0f172a' }}>{row.name}</p>
        </div>
      )
    },
    { header: 'Client', accessor: 'client' },
    {
      header: 'Budget',
      accessor: 'budget',
      cellStyle: { fontWeight: 600, color: '#0f172a' }
    },
    {
      header: 'Progress',
      accessor: 'progress',
      render: (row) => (
        <div style={{ width: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
            <span>{row.progress}</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: row.progress,
                height: '100%',
                backgroundColor: row.status === 'DELAYED' ? '#dc2626' : row.status === 'COMPLETED' ? '#059669' : '#1e3a8a',
                borderRadius: '9999px'
              }}
            />
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedRecord(row);
            setIsModalOpen(true);
          }}
        >
          Inspect
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Role Notice & Introduction */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} /> Phase 2 Verification: SaaS Layout & Design System Ready
          </h3>
          <p style={{ color: '#1e40af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Current View: <strong>{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')}).
            Try changing the <strong>Active Role</strong> dropdown in the top-right navbar to see the sidebar dynamically restructure!
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setSelectedRecord({ name: 'New Construction Project', id: 'DRAFT', client: 'TBD', budget: '$0', progress: '0%' });
            setIsModalOpen(true);
          }}
        >
          Open Test Modal
        </Button>
      </div>

      {/* KPI Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <Card
          title="Active Projects"
          value="12"
          subtitle="2 nearing handover"
          icon={HardHat}
          iconBg="#eff6ff"
          iconColor="#1e3a8a"
          trend="+18%"
          trendPositive={true}
        />
        <Card
          title="Workers On Site"
          value="248"
          subtitle="QR: 140 | GPS: 88 | Man: 20"
          icon={Users}
          iconBg="#ecfdf5"
          iconColor="#059669"
          trend="94% Turnout"
          trendPositive={true}
        />
        <Card
          title="Excess Material Flags"
          value="3"
          subtitle="Action required by Store Mgr"
          icon={AlertTriangle}
          iconBg="#fef2f2"
          iconColor="#dc2626"
          trend="High Risk"
          trendPositive={false}
        />
        <Card
          title="Total Budget Burn"
          value="$31.8M"
          subtitle="Remaining: $9.4M (77%)"
          icon={DollarSign}
          iconBg="#fef3c7"
          iconColor="#d97706"
          trend="On Track"
          trendPositive={true}
        />
      </div>

      {/* Interactive Status Badges Showcase */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0'
        }}
      >
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          Standardized Status Badge System
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Badge status="PENDING" />
          <Badge status="APPROVED" />
          <Badge status="REJECTED" />
          <Badge status="ACTIVE" />
          <Badge status="IN_PROGRESS" />
          <Badge status="ON_HOLD" />
          <Badge status="COMPLETED" />
          <Badge status="DELAYED" />
          <Badge status="EXCESS_FLAGGED" text="Excess Detected" />
          <Badge status="LOW_STOCK" text="Low Stock" />
          <Badge status="CRITICAL" text="Critical Priority" />
        </div>
      </div>

      {/* Button Variant Showcase */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0'
        }}
      >
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          Button System & Action Triggers
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Slate</Button>
          <Button variant="success">Approve / Issue</Button>
          <Button variant="danger">Reject / Cancel</Button>
          <Button variant="warning">Flag Excess</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="primary" loading={true}>Processing...</Button>
        </div>
      </div>

      {/* Responsive Data Table */}
      <Table
        title="Live Construction Projects Ledger"
        columns={columns}
        data={sampleProjects}
        searchPlaceholder="Filter projects by title, client, or code..."
        actions={
          <Button variant="outline" size="sm" icon={Filter}>
            Filter Columns
          </Button>
        }
      />

      {/* Interactive Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRecord ? `Project Details: ${selectedRecord.id}` : 'Create Record'}
        subtitle="Full operational inspection dialog"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert(`Inspection confirmed for ${selectedRecord?.name}`);
                setIsModalOpen(false);
              }}
            >
              Confirm Inspection
            </Button>
          </>
        }
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Project Title</label>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{selectedRecord.name}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Client Entity</label>
                <p style={{ fontSize: '0.9rem', color: '#334155' }}>{selectedRecord.client}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Allocated Budget</label>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>{selectedRecord.budget}</p>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Site Progress</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: selectedRecord.progress, height: '100%', backgroundColor: '#1e3a8a' }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{selectedRecord.progress}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

