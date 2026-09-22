const fs = require('fs');
const path = './src/pages/company-admin/CompanyAdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace { (proj.spent / 1000000).toFixed(2) }M with { proj.spent.toLocaleString('en-IN') }
content = content.replace(/\{\(proj\.spent \/ 1000000\)\.toFixed\(2\)\}M/g, "{proj.spent.toLocaleString('en-IN')}");
content = content.replace(/\{\(proj\.budget \/ 1000000\)\.toFixed\(2\)\}M/g, "{proj.budget.toLocaleString('en-IN')}");
content = content.replace(/\{\(totalBudget \/ 1000000\)\.toFixed\(2\)\}M/g, "{totalBudget.toLocaleString('en-IN')}");
content = content.replace(/\{\(remainingBudget \/ 1000000\)\.toFixed\(2\)\}M/g, "{remainingBudget.toLocaleString('en-IN')}");
content = content.replace(/\{\(totalSpent \/ 1000000\)\.toFixed\(2\)\}M/g, "{totalSpent.toLocaleString('en-IN')}");

fs.writeFileSync(path, content, 'utf8');
console.log('Done fixing currencies');
