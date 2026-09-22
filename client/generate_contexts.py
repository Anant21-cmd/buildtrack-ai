import os

contexts = [
    {
        'name': 'EquipmentContext',
        'var_name': 'equipment',
        'api_path': 'equipment',
        'methods': '''
  const addEquipment = async (eq) => {
    const res = await fetch('http://localhost:5000/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(eq)
    });
    if (res.ok) fetchEquipment();
  };

  const updateEquipmentStatus = async (id, status, projectId = null) => {
    const res = await fetch(`http://localhost:5000/api/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, projectId: status === 'In Use' ? projectId : undefined })
    });
    if (res.ok) fetchEquipment();
  };
''',
        'exports': 'equipment, addEquipment, updateEquipmentStatus'
    },
    {
        'name': 'TaskContext',
        'var_name': 'tasks',
        'api_path': 'tasks',
        'methods': '''
  const addTask = async (task) => {
    const res = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...task, status: 'Pending' })
    });
    if (res.ok) fetchTasks();
  };

  const updateTaskStatus = async (id, status) => {
    const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchTasks();
  };
''',
        'exports': 'tasks, addTask, updateTaskStatus'
    },
    {
        'name': 'IssueContext',
        'var_name': 'issues',
        'api_path': 'issues',
        'methods': '''
  const addIssue = async (issue) => {
    const res = await fetch('http://localhost:5000/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...issue, status: 'Open' })
    });
    if (res.ok) fetchIssues();
  };

  const updateIssueStatus = async (id, status) => {
    const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchIssues();
  };
''',
        'exports': 'issues, addIssue, updateIssueStatus'
    },
    {
        'name': 'FinanceContext',
        'var_name': 'transactions',
        'api_path': 'expenses',
        'methods': '''
  const [budgets, setBudgets] = useState([]); 
  
  const addTransaction = async (tx) => {
    const res = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(tx)
    });
    if (res.ok) fetchTransactions();
  };
''',
        'exports': 'budgets, transactions, addTransaction'
    },
    {
        'name': 'ProgressContext',
        'var_name': 'progressRecords',
        'api_path': 'progress',
        'methods': '''
  const logProgress = async (progress) => {
    const res = await fetch('http://localhost:5000/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(progress)
    });
    if (res.ok) fetchProgressRecords();
  };
''',
        'exports': 'progressRecords, logProgress'
    }
]

for ctx in contexts:
    short_name = ctx['name'].replace('Context', '')
    capital_var = ctx['var_name'][0].upper() + ctx['var_name'][1:]
    
    code = f"""import React, {{ createContext, useContext, useState, useEffect, useCallback }} from 'react';
import {{ useAuth }} from './AuthContext';

const {ctx['name']} = createContext();
export const use{short_name} = () => useContext({ctx['name']});

export const {short_name}Provider = ({{ children }}) => {{
  const [{ctx['var_name']}, set{capital_var}] = useState([]);
  const {{ currentUser, token }} = useAuth();

  const fetch{capital_var} = useCallback(async () => {{
    if (!token || !currentUser?.companyId) return;
    try {{
      const res = await fetch('http://localhost:5000/api/{ctx['api_path']}', {{
        headers: {{ Authorization: `Bearer ${{token}}` }}
      }});
      const data = await res.json();
      if (res.ok) set{capital_var}(data);
    }} catch (err) {{
      console.error('Failed to fetch {ctx['var_name']}', err);
    }}
  }}, [token, currentUser]);

  useEffect(() => {{
    if (currentUser?.companyId) fetch{capital_var}();
  }}, [currentUser, fetch{capital_var}]);

{ctx['methods']}

  return (
    <{ctx['name']}.Provider value={{{{ {ctx['exports']} }}}}>
      {{children}}
    </{ctx['name']}.Provider>
  );
}};
"""
    
    with open(f'src/context/{ctx["name"]}.jsx', 'w', encoding='utf-8') as f:
        f.write(code)

print("Generated contexts")

