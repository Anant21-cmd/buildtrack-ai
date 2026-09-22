import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCompany } from '../../context/CompanyContext';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Users,
  Briefcase,
  UserCheck,
  CalendarCheck,
  Package,
  AlertTriangle,
  Truck,
  FileText,
  DollarSign,
  TrendingUp,
  Bell,
  Shield,
  Settings,
  HardHat,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { currentUser } = useAuth();
  const { companies } = useCompany();
  const location = useLocation();

  // Role-based menu definition
  const getNavItems = () => {
    // If inside a specific project, show project-level sidebar
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'projects' && pathParts[2]) {
      const projectId = pathParts[2];
      return [
        { label: '← Back to Projects', path: '/projects', icon: Briefcase },
        { label: 'Project Dashboard', path: `/projects/${projectId}?tab=OVERVIEW`, icon: LayoutDashboard },
        { label: 'Workforce & Teams', path: `/projects/${projectId}?tab=WORKFORCE`, icon: Users },
        { label: 'Materials & Stock', path: `/projects/${projectId}?tab=MATERIALS`, icon: Package },
        { label: 'Tasks & Machinery', path: `/projects/${projectId}?tab=TASKS`, icon: CheckSquare },
        { label: 'Budget & Ledgers', path: `/projects/${projectId}?tab=FINANCE`, icon: DollarSign }
      ];
    }

    switch (currentUser?.role) {
      case ROLES.SUPER_ADMIN: {
        const pendingCount = companies ? companies.filter(c => c.status === 'PENDING').length : 0;
        return [
          { label: 'Platform Overview', path: '/super-admin/dashboard', icon: LayoutDashboard },
          { label: 'Company Approvals', path: '/super-admin/pending-approvals', icon: CheckSquare, badge: pendingCount > 0 ? pendingCount.toString() : undefined },
          { label: 'All Companies', path: '/super-admin/companies', icon: Building2 },
          { label: 'Platform Users', path: '/super-admin/users', icon: Users },
          { label: 'System Reports', path: '/super-admin/reports', icon: FileText },
          { label: 'Audit Logs', path: '/super-admin/audit-logs', icon: Shield },
          { label: 'Platform Settings', path: '/super-admin/settings', icon: Settings }
        ];
      }

      case ROLES.SITE_ENGINEER:
        return [
          { label: 'Site Dashboard', path: '/engineer/dashboard', icon: LayoutDashboard },
          { label: 'My Projects', path: '/projects', icon: Briefcase },
          { label: 'Worker Attendance', path: '/attendance', icon: CalendarCheck },
          { label: 'Material Requests', path: '/materials/requests', icon: Package },
          { label: 'Issue Reporting', path: '/issues', icon: AlertTriangle },
          { label: 'Daily Progress (DPR)', path: '/progress', icon: TrendingUp },
          { label: 'Site Tasks', path: '/tasks', icon: CheckSquare },
          { label: 'Equipment Status', path: '/equipment', icon: Truck },
          { label: 'Notifications', path: '/notifications', icon: Bell }
        ];

      case ROLES.STORE_MANAGER:
        return [
          { label: 'Store Dashboard', path: '/store/dashboard', icon: LayoutDashboard },
          { label: 'Material Inventory', path: '/materials', icon: Package },
          { label: 'Pending Requests', path: '/materials/requests', icon: AlertTriangle },
          { label: 'Excess Approvals', path: '/materials/excess-trap', icon: Shield },
          { label: 'Vendors & Suppliers', path: '/vendors', icon: Building2 },
          { label: 'Purchase Orders', path: '/vendors/purchase-orders', icon: FileText },
          { label: 'Receiving Verification', path: '/vendors/receiving', icon: UserCheck },
          { label: 'Notifications', path: '/notifications', icon: Bell }
        ];

      case ROLES.CONTRACTOR:
        return [
          { label: 'Contractor Hub', path: '/contractor/dashboard', icon: LayoutDashboard },
          { label: 'Assigned Projects', path: '/contractor/projects', icon: Briefcase },
          { label: 'Assigned Workers', path: '/contractor/workers', icon: Users },
          { label: 'Task Execution', path: '/contractor/tasks', icon: CheckSquare },
          { label: 'Approved Materials', path: '/contractor/materials', icon: Package }
        ];

      case ROLES.CLIENT:
        return [
          { label: 'Executive Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
          { label: 'My Construction Projects', path: '/client/projects', icon: Briefcase },
          { label: 'Milestone Progress', path: '/client/milestones', icon: TrendingUp },
          { label: 'Approved Reports', path: '/client/reports', icon: FileText }
        ];

      case ROLES.COMPANY_ADMIN:
      default:
        return [
          { label: 'Dashboard', path: '/company-admin/dashboard', icon: LayoutDashboard },
          { label: 'Projects', path: '/projects', icon: Briefcase },
          { label: 'Company Settings', path: '/settings', icon: Settings }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 40
          }}
          className="mobile-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: isCollapsed ? '78px' : '260px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease',
          zIndex: 50,
          position: 'relative',
          borderRight: '1px solid #1e293b'
        }}
        className={`sidebar-aside ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0' : '0 1.25rem',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                padding: '0.45rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <HardHat size={20} />
            </div>
            {!isCollapsed && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                  BUILDTRACK <span style={{ color: '#f59e0b' }}>AI</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Site OS
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            style={{ color: '#94a3b8', display: 'none' }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0.65rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                style={({ isActive }) => {
                  // Check if path has query params (for project tabs)
                  const hasQueryParams = item.path.includes('?');
                  const isTabActive = hasQueryParams 
                    ? location.search === item.path.substring(item.path.indexOf('?'))
                    : isActive;
                    
                  // If no search params in URL but path has OVERVIEW, make it active by default
                  const isDefaultActive = hasQueryParams && item.path.includes('OVERVIEW') && !location.search;
                  
                  const finalActive = isTabActive || isDefaultActive;

                  return {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: isCollapsed ? '0.65rem 0' : '0.6rem 0.85rem',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: '6px',
                    color: finalActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: finalActive ? '#1e3a8a' : 'transparent',
                    fontWeight: finalActive ? 600 : 500,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  };
                }}
                className="nav-link-item"
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: item.badge === 'Warning' || item.badge === 'Alert' ? '#dc2626' : '#d97706',
                      color: '#ffffff',
                      fontWeight: 700
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Collapse Toggle Footer */}
        <div
          style={{
            padding: '0.75rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between'
          }}
          className="sidebar-collapse-footer"
        >
          {!isCollapsed && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Collapse Menu
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              padding: '0.4rem',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
