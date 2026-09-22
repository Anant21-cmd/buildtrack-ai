const fs = require('fs');
let app = fs.readFileSync('client/src/App.jsx', 'utf8');

const missingRoutes = `
                                      <Route path="company-admin/dashboard" element={<CompanyAdminDashboard />} />
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
                                      
                                      <Route path="audit-logs" element={<AuditLogsView />} />
                                      <Route path="*" element={<SuperAdminDashboard />} />

                                      {/* Common Authorized Modules */}
`;

app = app.replace('{/* Common Authorized Modules */}', missingRoutes);
fs.writeFileSync('client/src/App.jsx', app);

