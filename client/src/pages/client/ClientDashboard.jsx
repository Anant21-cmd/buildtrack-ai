import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { DollarSign, Activity, Image as ImageIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useMarketPrices } from '../../context/MarketPriceContext';

export default function ClientDashboard() {
  const { projects } = useProjects();
  const { marketPrices, loading } = useMarketPrices();
  
  // For demo, just aggregate all projects if they have any, or use 0
  const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const progress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Client Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Real-time visibility into your project's progress, financial health, and material market indices.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard title="Overall Progress" value={`${progress}%`} icon={Activity} color="#16a34a" />
        <MetricCard title="Budget Utilized" value={`₹${totalSpent.toLocaleString('en-IN')}`} icon={DollarSign} color="#2563eb" />
        <MetricCard title="Latest Updates" value="0 Photos" icon={ImageIcon} color="#ca8a04" />
      </div>

      <Card title="Current Construction Material Market Prices (Madurai, TN)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            * Market prices are indicative and may vary based on supplier, brand, location, and transport.
          </p>
          
          {loading ? (
            <p>Loading market prices...</p>
          ) : marketPrices.length === 0 ? (
            <p>No market price data available.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>Material</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>Brand/Spec</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>Current Price</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>Trend</th>
                    <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontWeight: 600 }}>Source & Freshness</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPrices.map((price) => (
                    <tr key={price.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{price.materialName}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{price.brand} ({price.specification})</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        ₹{price.price.toLocaleString('en-IN')} <span style={{ fontSize: '0.8em', color: '#64748b', fontWeight: 500 }}>/ {price.unit}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b' }}>
                          <Minus size={16} /> <span>Stable</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.8rem', color: '#475569' }}>{price.sourceName}</span>
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>{price.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <Card title="Project Milestones">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {projects.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No projects assigned to you yet.</p>
          ) : (
            <MilestoneRow title={`${projects[0].name} Started`} date={new Date(projects[0].startDate).toLocaleDateString()} status="COMPLETED" />
          )}
          <MilestoneRow title="Foundation & Substructure" date="Expected Phase 1" status="PENDING" />
          <MilestoneRow title="MEP Rough-ins" date="Expected Phase 2" status="PENDING" />
        </div>
      </Card>
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

function MilestoneRow({ title, date, status }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '0.9rem' }}>{title}</h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{date}</p>
      </div>
      <Badge status={status} />
    </div>
  );
}

