import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# Fix Project
if 'dailyProgress      DailyProgress[]' not in schema:
    schema = schema.replace('tasks          Task[]\n  issues         Issue[]', 'tasks          Task[]\n  issues         Issue[]\n  dailyProgress  DailyProgress[]\n  expenses       Expense[]')

# Remove auditLogs from Company and User since AuditLog doesn't have relations
schema = re.sub(r'^\s*auditLogs\s+AuditLog\[\].*$\n?', '', schema, flags=re.MULTILINE)

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)
