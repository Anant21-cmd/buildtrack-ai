import React, { useEffect, useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { useProjects } from '../../context/ProjectContext';
import Card from '../../components/common/Card';
import { Calendar, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ClientMilestones() {
  const { dprs, fetchDprs, loading } = useProgress();
  const { projects } = useProjects();

  useEffect(() => {
    fetchDprs();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">Site Timeline</h1>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading timeline...</div>
      </div>
    );
  }

  if (!dprs || dprs.length === 0) {
    return (
      <div className="page-container">
        <h1 className="page-title">Site Timeline</h1>
        <Card style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No construction updates have been posted yet. Check back later!
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Site Timeline & Visual Progress</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {dprs.map((report) => {
          const project = projects?.find(p => p.id === report.projectId);
          
          return (
            <Card key={report.id} style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      {project ? project.name : 'Unknown Project'}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} /> {new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={14} /> {report.workersPresent} Workers On-site
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 700 }}>
                    <CheckCircle2 size={18} />
                    {report.progressPct}% Complete
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Work Completed</h4>
                  <p style={{ color: '#1e293b', lineHeight: 1.6, margin: 0 }}>{report.completed}</p>
                </div>

                {report.issues && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fff7ed', borderLeft: '4px solid #f97316', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}>
                      <AlertCircle size={16} /> Issues / Delays Reported
                    </h4>
                    <p style={{ color: '#9a3412', margin: 0, fontSize: '0.9rem' }}>{report.issues}</p>
                  </div>
                )}

                {report.mediaUrls && report.mediaUrls.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Site Media</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      {report.mediaUrls.map((url, idx) => (
                        <div key={idx} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '4/3', backgroundColor: '#f1f5f9' }}>
                          {url.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={url} alt={`Site progress ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

