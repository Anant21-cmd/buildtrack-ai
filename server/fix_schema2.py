import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

schema = schema.replace('  issues         Issue[]\n}', '  issues         Issue[]\n  dailyProgress  DailyProgress[]\n  expenses       Expense[]\n}')

# Also fix the Company missing opposite fields
schema = schema.replace('  equipment          Equipment[]\n}', '  equipment          Equipment[]\n  dailyProgress  DailyProgress[]\n  expenses       Expense[]\n}')


with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)
