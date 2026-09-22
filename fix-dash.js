const fs = require('fs');
let content = fs.readFileSync('client/src/pages/projects/ProjectDashboard.jsx', 'utf8');

// The original strings to replace:
// `₹${(project.spent / 1000000).toFixed(2)}M`
// `Remaining: ₹${(remainingBudget / 1000000).toFixed(2)}M`
// {(project.budget / 1000000).toFixed(2)}M
// {(project.spent / 1000000).toFixed(2)}M
// {(remainingBudget / 1000000).toFixed(2)}M

content = content.replace(/\(project\.spent \/ 1000000\)\.toFixed\(2\)\}M/g, "project.spent.toLocaleString('en-IN')}");
content = content.replace(/\(remainingBudget \/ 1000000\)\.toFixed\(2\)\}M/g, "remainingBudget.toLocaleString('en-IN')}");
content = content.replace(/\(project\.budget \/ 1000000\)\.toFixed\(2\)\}M/g, "project.budget.toLocaleString('en-IN')}");

fs.writeFileSync('client/src/pages/projects/ProjectDashboard.jsx', content);

