import os

files = {
    'src/context/IssueContext.jsx': ('useIssue', 'useIssues'),
    'src/context/TaskContext.jsx': ('useTask', 'useTasks')
}

for filepath, (old, new) in files.items():
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We replace export const useIssue = ...
    content = content.replace(f'export const {old} =', f'export const {new} =')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed exports.")
