const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf-8');
console.log(content.includes('import { AuthProvider, useAuth, ROLES } from \'./context/AuthContext\''));
