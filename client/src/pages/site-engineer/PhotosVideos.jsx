import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Camera,
  Video,
  FileVideo,
  Trash2,
  CheckCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';

export default function PhotosVideos() {
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const safeProjects = Array.isArray(projects) ? projects : [];

  const { photos: mediaItems, addPhoto, deletePhoto } = useReports();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const initialForm = {
    projectId: '',
    caption: '',
    category: 'Progress Update',
    mediaUrl: '',
    type: 'PHOTO' // PHOTO or VIDEO
  };
  const [formData, setFormData] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);

  const getProjectName = (id) => safeProjects.find(p => p.id === id)?.name || 'Unknown Project';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      setFormData({
        ...formData,
        mediaUrl: url,
        type: isVideo ? 'VIDEO' : 'PHOTO'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mediaUrl) {
      alert("Please select a file to upload.");
      return;
    }
    
    let persistentUrl = formData.mediaUrl;
    if (selectedFile) {
      try {
        const uploadData = new FormData();
        uploadData.append('media', selectedFile);
        const token = localStorage.getItem('buildtrack_token') || localStorage.getItem('token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.mediaUrls && json.mediaUrls.length > 0) {
            persistentUrl = json.mediaUrls[0];
          }
        }
      } catch (err) {
        console.error('Upload failed', err);
      }
    }

    const newMedia = {
      projectId: formData.projectId,
      url: persistentUrl,
      description: formData.caption || 'Progress update'
    };
    
    try {
      await addPhoto(newMedia);
      setIsModalOpen(false);
      setFormData(initialForm);
    } catch (err) {
      console.error('Error adding photo:', err);
      alert('Failed to add photo');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this media file?')) {
      await deletePhoto(id);
    }
  };

  const filteredMedia = mediaItems.filter(m => {
    const desc = m.description || m.caption || '';
    const matchesSearch = desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === '' || m.projectId === projectFilter;

    return matchesSearch && matchesProject;
  });

  // Calculate stats
  const totalPhotos = mediaItems.length;
  const totalVideos = 0; // Not supported by schema natively without type field

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={28} style={{ color: '#3b82f6' }} />
            Site Media Gallery
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Upload, organize, and view progress photos and videos from the site.
          </p>
        </div>
        <Button variant="primary" icon={Upload} onClick={() => setIsModalOpen(true)}>
          Upload Media
        </Button>
      </div>

      {/* Toolbar & Stats */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            <div style={{ minWidth: '250px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by caption..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.2rem 0.5rem', backgroundColor: '#f8fafc' }}>
              <MapPin size={16} color="#64748b" />
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem', padding: '0.5rem' }}
              >
                <option value="">All Projects</option>
                {safeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.2rem 0.5rem', backgroundColor: '#f8fafc' }}>
              <Filter size={16} color="#64748b" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem', padding: '0.5rem' }}
              >
                <option value="">All Media Types</option>
                <option value="PHOTO">Photos Only</option>
                <option value="VIDEO">Videos Only</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Photos</span>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{totalPhotos}</p>
            </div>
            <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0' }}></div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Videos</span>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{totalVideos}</p>
            </div>
          </div>
          
        </div>
      </Card>

      {/* Media Grid */}
      <div>
        {filteredMedia.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <ImageIcon size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>No media uploaded yet</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Upload site photos and videos to maintain a visual history of progress.</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Upload Media</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredMedia.map(m => (
              <div key={m.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                
                {/* Image/Video Preview */}
                <div style={{ width: '100%', height: '200px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                  <img 
                    src={m.url || m.mediaUrl} 
                    alt={m.description || m.caption || 'Site Photo'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                    <Badge status="ACTIVE" text="Progress Update" />
                  </div>
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600 }}>
                    <Camera size={12} />
                    PHOTO
                  </div>
                </div>

                {/* Media Info */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', lineHeight: '1.4' }}>
                    {m.description || m.caption}
                  </p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} /> {getProjectName(m.projectId)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} /> {new Date(m.uploadDate || m.date).toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: 500 }}>Uploaded by {m.uploadedBy}</span>
                      <button 
                        onClick={() => handleDelete(m.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                        title="Delete Media"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Site Media">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Select Photo or Video *</label>
            <input 
              type="file" 
              accept="image/*,video/*"
              required
              onChange={handleFileChange}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px dashed #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer' }}
            />
            {formData.mediaUrl && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={14} /> File selected successfully
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Project Site *</label>
              <select 
                required
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="">Select Project</option>
                {safeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Media Category *</label>
              <select 
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="Progress Update">Progress Update</option>
                <option value="Defect / Issue">Defect / Issue</option>
                <option value="Safety Hazard">Safety Hazard</option>
                <option value="Material Delivery">Material Delivery</option>
                <option value="Milestone Completion">Milestone Completion</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Caption / Description *</label>
            <textarea 
              required
              rows={2}
              value={formData.caption}
              onChange={e => setFormData({...formData, caption: e.target.value})}
              placeholder="Describe what is shown in this media..."
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" icon={Upload}>Upload File</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
