import os

entities = [
    ('attendance', 'Attendance', 'worker'),
    ('progress', 'DailyProgress', 'project'),
    ('expense', 'Expense', 'project'),
    ('equipment', 'Equipment', 'company'),
    ('issue', 'Issue', 'project'),
    ('task', 'Task', 'project'),
    ('materialRequest', 'MaterialRequest', 'project')
]

controller_template = """const prisma = require('../config/prisma');

exports.create{entity_pascal} = async (req, res, next) => {{
  try {{
    if (!req.user.companyId) return res.status(403).json({{ message: 'Must belong to a company' }});
    
    // Validate if the parent belongs to the company
    let parentCompanyId = null;
    {parent_validation}
    
    const record = await prisma.{entity_camel}.create({{ data: req.body }});
    res.status(201).json(record);
  }} catch (error) {{
    next(error);
  }}
}};

exports.getCompany{entity_pascal}s = async (req, res, next) => {{
  try {{
    if (!req.user.companyId) return res.status(403).json({{ message: 'Must belong to a company' }});

    {fetch_logic}
    res.status(200).json(records);
  }} catch (error) {{
    next(error);
  }}
}};

exports.update{entity_pascal} = async (req, res, next) => {{
  try {{
    const {{ id }} = req.params;
    const record = await prisma.{entity_camel}.findUnique({{ where: {{ id }} }});
    if (!record) return res.status(404).json({{ message: 'Not found' }});

    const updated = await prisma.{entity_camel}.update({{
      where: {{ id }},
      data: req.body
    }});
    res.status(200).json(updated);
  }} catch (error) {{
    next(error);
  }}
}};
"""

for entity_camel, entity_pascal, parent in entities:
    if parent == 'company':
        parent_validation = "req.body.companyId = req.user.companyId;"
        fetch_logic = f"const records = await prisma.{entity_camel}.findMany({{ where: {{ companyId: req.user.companyId }} }});"
    elif parent == 'project':
        parent_validation = "/* We assume project is valid */"
        fetch_logic = f"const projects = await prisma.project.findMany({{ where: {{ companyId: req.user.companyId }}, select: {{ id: true }} }});\n    const projectIds = projects.map(p => p.id);\n    const records = await prisma.{entity_camel}.findMany({{ where: {{ projectId: {{ in: projectIds }} }} }});"
    elif parent == 'worker':
        parent_validation = "/* We assume worker is valid */"
        fetch_logic = f"const workers = await prisma.worker.findMany({{ where: {{ companyId: req.user.companyId }}, select: {{ id: true }} }});\n    const workerIds = workers.map(w => w.id);\n    const records = await prisma.{entity_camel}.findMany({{ where: {{ workerId: {{ in: workerIds }} }} }});"

    controller_code = controller_template.format(
        entity_camel=entity_camel, 
        entity_pascal=entity_pascal,
        parent_validation=parent_validation,
        fetch_logic=fetch_logic
    )
    
    route_template = """const express = require('express');
const router = express.Router();
const controller = require('../controllers/{entity_camel}Controller');
const {{ protect }} = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', controller.create{entity_pascal});
router.get('/', controller.getCompany{entity_pascal}s);
router.put('/:id', controller.update{entity_pascal});

module.exports = router;
"""
    route_code = route_template.format(entity_camel=entity_camel, entity_pascal=entity_pascal)
    
    with open(f'src/controllers/{entity_camel}Controller.js', 'w', encoding='utf-8') as f:
        f.write(controller_code)
        
    with open(f'src/routes/{entity_camel}Routes.js', 'w', encoding='utf-8') as f:
        f.write(route_code)

print("Generated.")
