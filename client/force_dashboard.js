const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf-8');

// Replace RoleBasedHome logic
content = content.replace(
  'return <ComponentShowcase />;',
  'return <SuperAdminDashboard />;' // Force it to always return SuperAdminDashboard for testing
);

fs.writeFileSync('src/App.jsx', content);
console.log('Forced SuperAdminDashboard');
