import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf-8');
content = content.replace(
  'if (currentUser?.role === ROLES.SUPER_ADMIN) return <SuperAdminDashboard />;',
  'if (currentUser?.role === \\'SUPER_ADMIN\\' || currentUser?.role === ROLES.SUPER_ADMIN) return <SuperAdminDashboard />;'
);
content = content.replace(
  'if (currentUser?.role === ROLES.COMPANY_ADMIN) return <CompanyAdminDashboard />;',
  'if (currentUser?.role === \\'COMPANY_ADMIN\\' || currentUser?.role === ROLES.COMPANY_ADMIN) return <CompanyAdminDashboard />;'
);

fs.writeFileSync('src/App.jsx', content);
console.log('Patched App.jsx');
