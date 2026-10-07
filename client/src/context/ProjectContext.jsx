import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const PROJECT_STATUSES = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const { currentUser, token } = useAuth();

  const fetchProjects = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) fetchProjects();
  }, [currentUser, fetchProjects]);

  const addProject = async (projectData) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(projectData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to add project');
    fetchProjects();
    return result;
  };

  const updateProject = async (id, updatedData) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) fetchProjects();
  };

  const archiveProject = async (id) => updateProject(id, { isArchived: true, status: 'CANCELLED' });
  const unarchiveProject = async (id) => updateProject(id, { isArchived: false, status: 'PLANNING' });
  const getProject = (id) => projects.find((p) => p.id === id);

  return (
    <ProjectContext.Provider value={{ projects, addProject, updateProject, archiveProject, unarchiveProject, getProject, refreshData: fetchProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
}
