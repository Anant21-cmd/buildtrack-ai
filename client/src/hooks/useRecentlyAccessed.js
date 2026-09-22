import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RECENT_PAGES_KEY = 'buildtrack_recent_pages';

const PAGE_NAMES = {
  '/dashboard': 'Dashboard Overview',
  '/projects': 'Project Portfolio',
  '/workers': 'Worker Directory',
  '/attendance': 'Attendance Records',
  '/materials': 'Material Inventory',
  '/finance': 'Financial Dashboard',
  '/equipment': 'Equipment Manager',
  '/issues': 'Issue Tracker',
  '/tasks': 'Task Management'
};

export function useRecentlyAccessed() {
  const location = useLocation();
  const [recentPages, setRecentPages] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(RECENT_PAGES_KEY) || '[]');
    setRecentPages(saved);
  }, []);

  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/') return;

    let pageName = PAGE_NAMES[location.pathname];
    
    // Attempt to parse dynamic routes if not exact match
    if (!pageName) {
      if (location.pathname.startsWith('/projects/')) pageName = 'Project Details';
      else if (location.pathname.startsWith('/materials/')) pageName = 'Material Logs';
      else pageName = location.pathname.split('/').pop().replace(/-/g, ' ');
    }

    // Capitalize page name safely
    pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    const newEntry = {
      path: location.pathname,
      name: pageName,
      timestamp: new Date().toISOString()
    };

    setRecentPages(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(p => p.path !== newEntry.path);
      // Add to front, keep max 5
      const updated = [newEntry, ...filtered].slice(0, 5);
      localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [location.pathname]);

  return recentPages;
}

