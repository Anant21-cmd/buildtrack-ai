import React from 'react';
import Card from '../../components/common/Card';
import { useReports } from '../../context/ReportContext';

const ReportList = () => {
  const { reports, photos } = useReports();

  return (
    <div className="page-container">
      <h1 className="page-title">Site Reports & Photos</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Latest Site Reports</h2>
          {reports.length === 0 ? (
            <Card><p style={{ color: '#64748b' }}>No reports available.</p></Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map(report => (
                <Card key={report.id}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>{report.project?.name || 'Project'}</strong> - {new Date(report.date).toLocaleDateString()}
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>{report.workDescription}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>Progress: {report.progressPct}%</span>
                    <span>Workers: {report.manpowerCount}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Latest Photos</h2>
          {photos.length === 0 ? (
            <Card><p style={{ color: '#64748b' }}>No photos available.</p></Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {photos.map(photo => (
                <Card key={photo.id} style={{ padding: '0.5rem' }}>
                  <img src={photo.url} alt="Site" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {photo.description || 'No description'}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ReportList;

