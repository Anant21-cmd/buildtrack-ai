import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Chatbot from '../components/dashboard/Chatbot';
import { useRecentlyAccessed } from '../hooks/useRecentlyAccessed';

export default function DashboardLayout({ children }) {
  // Global listener for recently accessed tracker
  useRecentlyAccessed();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
      {/* Dynamic Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main App Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            {children || <Outlet />}
          </div>
        </main>
      </div>
      
      {/* Universal Floating AI Chatbot */}
      <Chatbot />
    </div>
  );
}

