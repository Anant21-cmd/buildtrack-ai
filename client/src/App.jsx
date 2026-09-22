import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { ProjectProvider } from './context/ProjectContext';
import { WorkerProvider } from './context/WorkerContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { MaterialProvider } from './context/MaterialContext';
import { MaterialRequestProvider } from './context/MaterialRequestContext';
import { VendorProvider } from './context/VendorContext';
import { IssueProvider } from './context/IssueContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { TaskProvider } from './context/TaskContext';
import { ProgressProvider } from './context/ProgressContext';
import { FinanceProvider } from './context/FinanceContext';
import { MarketPriceProvider } from './context/MarketPriceContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import ComponentShowcase from './pages/common/ComponentShowcase';
import SystemReports from './pages/super-admin/SystemReports';
import PlatformUsers from './pages/super-admin/PlatformUsers';
import GlobalSettings from './pages/super-admin/GlobalSettings';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import CompanyAdminDashboard from './pages/company-admin/CompanyAdminDashboard';
import TeamManagement from './pages/company-admin/TeamManagement';
import SiteEngineerDashboard from './pages/site-engineer/SiteEngineerDashboard';
import StoreManagerDashboard from './pages/store-manager/StoreManagerDashboard';
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientMilestones from './pages/client/ClientMilestones';
import CompanyManagement from './pages/super-admin/CompanyManagement';
import AuditLogsView from './pages/super-admin/AuditLogsView';
import CompanyRegister from './pages/auth/CompanyRegister';
import ProjectList from './pages/projects/ProjectList';
import ProjectDashboard from './pages/projects/ProjectDashboard';
import WorkerList from './pages/workers/WorkerList';
import AttendanceCenter from './pages/attendance/AttendanceCenter';
import MaterialInventory from './pages/materials/MaterialInventory';
import MaterialRequests from './pages/materials/MaterialRequests';
import VendorList from './pages/vendors/VendorList';
import PurchaseOrders from './pages/vendors/PurchaseOrders';
import MaterialReceiving from './pages/vendors/MaterialReceiving';
import IssueList from './pages/issues/IssueList';
import EquipmentList from './pages/equipment/EquipmentList';
import TaskList from './pages/tasks/TaskList';
import DailyProgress from './pages/progress/DailyProgress';
import FinanceDashboard from './pages/finance/FinanceDashboard';
import ReportList from './pages/reports/ReportList';
import NotificationList from './pages/notifications/NotificationList';
import CompanySettings from './pages/settings/CompanySettings';
import Login from './pages/auth/Login';
import Unauthorized from './pages/auth/Unauthorized';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fee2e2', height: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ fontSize: '0.8rem' }}>{this.state.info && this.state.info.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Intelligent landing page based on active role
function RoleBasedHome() {
  const { currentUser, ROLES } = useAuth();
  
  if (!currentUser || !ROLES) return <SuperAdminDashboard />;

  if (currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === 'SUPER_ADMIN') return <SuperAdminDashboard />;
  if (currentUser.role === ROLES.COMPANY_ADMIN || currentUser.role === 'COMPANY_ADMIN') return <CompanyAdminDashboard />;
  if (currentUser.role === ROLES.SITE_ENGINEER || currentUser.role === 'SITE_ENGINEER') return <SiteEngineerDashboard />;
  if (currentUser.role === ROLES.STORE_MANAGER || currentUser.role === 'STORE_MANAGER') return <StoreManagerDashboard />;
  if (currentUser.role === ROLES.CONTRACTOR || currentUser.role === 'CONTRACTOR') return <ContractorDashboard />;
  if (currentUser.role === ROLES.CLIENT || currentUser.role === 'CLIENT') return <ClientDashboard />;

  return <SuperAdminDashboard />; // Fallback
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CompanyProvider>
          <ProjectProvider>
            <WorkerProvider>
              <AttendanceProvider>
                <MaterialProvider>
                  <MaterialRequestProvider>
                    <VendorProvider>
                      <IssueProvider>
                        <EquipmentProvider>
                          <TaskProvider>
                            <ProgressProvider>
                              <FinanceProvider>
                                <MarketPriceProvider>
                                  <BrowserRouter>
                                    <div className="app-container">
                                      <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register-company" element={<CompanyRegister />} />
                                        <Route path="/unauthorized" element={<Unauthorized />} />

                                        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                                          <Route index element={<RoleBasedHome />} />
                                          <Route path="company-admin/dashboard" element={<CompanyAdminDashboard />} />
                                          <Route path="team-management" element={<TeamManagement />} />
                                          <Route path="engineer/dashboard" element={<SiteEngineerDashboard />} />
                                          <Route path="store/dashboard" element={<StoreManagerDashboard />} />
                                          <Route path="contractor/dashboard" element={<ContractorDashboard />} />
                                          <Route path="client/dashboard" element={<ClientDashboard />} />
                                          
                                          <Route path="projects/:id" element={<ProjectDashboard />} />
                                          <Route path="materials/requests" element={<MaterialRequests />} />
                                          <Route path="materials/excess-trap" element={<MaterialRequests />} />
                                          <Route path="vendors/purchase-orders" element={<PurchaseOrders />} />
                                          <Route path="vendors/receiving" element={<MaterialReceiving />} />
                                          
                                          <Route path="super-admin/dashboard" element={<SuperAdminDashboard />} />
                                          <Route path="super-admin/pending-approvals" element={<CompanyManagement />} />
                                          
                                          <Route path="client/projects" element={<ProjectList />} />
                                          <Route path="client/milestones" element={<ClientMilestones />} />
                                          <Route path="client/reports" element={<ReportList />} />

                                          <Route path="audit-logs" element={<AuditLogsView />} />
                                          <Route path="*" element={<RoleBasedHome />} />

                                          <Route path="projects" element={<ProjectList />} />
                                          <Route path="workers" element={<WorkerList />} />
                                          <Route path="attendance" element={<AttendanceCenter />} />
                                          <Route path="materials" element={<MaterialInventory />} />
                                          <Route path="material-requests" element={<MaterialRequests />} />
                                          <Route path="receiving" element={<MaterialReceiving />} />
                                          <Route path="vendors" element={<VendorList />} />
                                          <Route path="purchase-orders" element={<PurchaseOrders />} />
                                          <Route path="equipment" element={<EquipmentList />} />
                                          <Route path="tasks" element={<TaskList />} />
                                          <Route path="progress" element={<DailyProgress />} />
                                          <Route path="issues" element={<IssueList />} />
                                          <Route path="finance" element={<FinanceDashboard />} />
                                          
                                          <Route path="reports" element={<ReportList />} />
                                          <Route path="notifications" element={<NotificationList />} />
                                          <Route path="settings" element={<CompanySettings />} />
                                          <Route path="components" element={<ComponentShowcase />} />

                                          <Route path="super-admin/companies" element={<CompanyManagement />} />
                                          <Route path="super-admin/audit-logs" element={<AuditLogsView />} />
                                          <Route path="super-admin/reports" element={<SystemReports />} />
                                          <Route path="super-admin/users" element={<PlatformUsers />} />
                                          <Route path="super-admin/settings" element={<GlobalSettings />} />
                                        </Route>
                                      </Routes>
                                    </div>
                                  </BrowserRouter>
                                </MarketPriceProvider>
                              </FinanceProvider>
                            </ProgressProvider>
                          </TaskProvider>
                        </EquipmentProvider>
                      </IssueProvider>
                    </VendorProvider>
                  </MaterialRequestProvider>
                </MaterialProvider>
              </AttendanceProvider>
            </WorkerProvider>
          </ProjectProvider>
        </CompanyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
