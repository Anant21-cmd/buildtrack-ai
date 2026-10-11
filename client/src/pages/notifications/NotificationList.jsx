import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2,
  AlertTriangle,
  Package,
  MessageSquare,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationList() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = useState('ALL');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'UNREAD') return !n.read;
    if (activeTab === 'ALERTS') return n.type === 'ALERT' || n.type === 'SAFETY';
    return true;
  });

  const getIcon = (type) => {
    switch(type) {
      case 'SAFETY': return <AlertTriangle size={20} color="#ef4444" />;
      case 'MATERIAL': return <Package size={20} color="#8b5cf6" />;
      case 'MESSAGE': return <MessageSquare size={20} color="#3b82f6" />;
      case 'TASK': return <CheckCircle size={20} color="#10b981" />;
      default: return <Activity size={20} color="#64748b" />;
    }
  };

  const getIconBg = (type) => {
    switch(type) {
      case 'SAFETY': return '#fef2f2';
      case 'MATERIAL': return '#f3e8ff';
      case 'MESSAGE': return '#eff6ff';
      case 'TASK': return '#f0fdf4';
      default: return '#f1f5f9';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={28} style={{ color: '#f59e0b' }} />
            Notifications Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Stay updated on site activities, material requests, and safety alerts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <Button variant="outline" icon={Check} onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" icon={Trash2} onClick={clearAll} style={{ color: '#ef4444' }}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('ALL')}
          style={{ ...tabStyle(activeTab === 'ALL'), position: 'relative' }}
        >
          All Notifications
        </button>
        <button
          onClick={() => setActiveTab('UNREAD')}
          style={{ ...tabStyle(activeTab === 'UNREAD'), position: 'relative' }}
        >
          Unread 
          {unreadCount > 0 && (
            <span style={{ marginLeft: '0.5rem', backgroundColor: '#ef4444', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.7rem' }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ALERTS')}
          style={tabStyle(activeTab === 'ALERTS')}
        >
          System Alerts
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <div style={{ backgroundColor: '#f8fafc', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Bell size={36} style={{ color: '#cbd5e1' }} />
            </div>
            <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>You're all caught up!</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>You have no new notifications right now.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '1rem', 
                backgroundColor: notification.read ? '#fff' : '#f0f9ff', 
                padding: '1.25rem', 
                borderRadius: '10px', 
                border: '1px solid', 
                borderColor: notification.read ? '#e2e8f0' : '#bae6fd',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Unread dot indicator */}
              {!notification.read && (
                <div style={{ position: 'absolute', top: '1.25rem', left: '0.5rem', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
              )}

              {/* Icon */}
              <div style={{ 
                width: '42px', height: '42px', borderRadius: '10px', 
                backgroundColor: getIconBg(notification.type), 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                flexShrink: 0, marginLeft: !notification.read ? '0.5rem' : '0' 
              }}>
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    {notification.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>
                  {notification.message}
                </p>
                {notification.actionLabel && (
                  <Button variant="outline" size="sm">
                    {notification.actionLabel}
                  </Button>
                )}
              </div>
              
              {/* Mark as read single button */}
              {!notification.read && (
                <button 
                  onClick={() => markAsRead(notification.id)}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.25rem' }}
                  title="Mark as read"
                >
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper for inline tab styling
const tabStyle = (isActive) => ({
  padding: '0.5rem 1rem',
  border: 'none',
  backgroundColor: 'transparent',
  color: isActive ? '#1e3a8a' : '#64748b',
  fontWeight: isActive ? 700 : 500,
  fontSize: '0.9rem',
  cursor: 'pointer',
  borderBottom: isActive ? '2px solid #1e3a8a' : '2px solid transparent',
  marginBottom: '-0.5rem',
  transition: 'all 0.2s ease',
  outline: 'none'
});
