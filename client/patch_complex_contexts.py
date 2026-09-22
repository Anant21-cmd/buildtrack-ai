import os

def insert_fetch_logic(filepath, var_name, capital_var, api_path):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if f'fetch{capital_var}' in content:
        return

    if 'useAuth' not in content:
        content = content.replace("import React, { createContext, useContext, useState } from 'react';",
                                "import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';\nimport { useAuth } from './AuthContext';")

    search_str = f"const [{var_name}, set{capital_var}] = useState([]);"
    
    fetch_logic = f'''const [{var_name}, set{capital_var}] = useState([]);
  const {{ currentUser, token }} = useAuth();

  const fetch{capital_var} = useCallback(async () => {{
    if (!token || !currentUser?.companyId) return;
    try {{
      const res = await fetch(`http://localhost:5000/api/{api_path}`, {{
        headers: {{ Authorization: `Bearer ${{token}}` }}
      }});
      const data = await res.json();
      if (res.ok) set{capital_var}(data);
    }} catch (err) {{
      console.error('Failed to fetch', err);
    }}
  }}, [token, currentUser]);

  useEffect(() => {{
    if (currentUser?.companyId) fetch{capital_var}();
  }}, [currentUser, fetch{capital_var}]);
'''
    
    content = content.replace(search_str, fetch_logic)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

insert_fetch_logic('src/context/AttendanceContext.jsx', 'attendanceRecords', 'AttendanceRecords', 'attendance')
insert_fetch_logic('src/context/MaterialRequestContext.jsx', 'requests', 'Requests', 'material-requests')

print("Patched complex contexts.")

