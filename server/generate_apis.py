import os

entities = [
    ('attendance', 'Attendance', 'date', 'req.body'),
    ('progress', 'DailyProgress', 'date', 'req.body'),
    ('expense', 'Expense', 'date', 'req.body'),
    ('equipment', 'Equipment', 'name', 'req.body'),
    ('issue', 'Issue', 'title', 'req.body'),
    ('task', 'Task', 'title', 'req.body'),
    ('materialRequest', 'MaterialRequest', 'materialId', 'req.body')
]

controller_template = """const prisma = require('../config/prisma');

exports.create{entity_pascal} = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
    
    const data = {{ ...req.body, companyId: req.user.companyId }};
    
    const record = await prisma.{entity_camel}.create({{ data }});
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.getCompany{entity_pascal}s = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const records = await prisma.{entity_camel}.findMany({{
      where: {{ companyId: req.user.companyId }}
    }});
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

exports.update{entity_pascal} = async (req, res, next) => {
  try {
    const {{ id }} = req.params;
    const record = await prisma.{entity_camel}.findUnique({{ where: {{ id }} }});
    if (!record) return res.status(404).json({ message: 'Not found' });
    if (record.companyId && record.companyId !== req.user.companyId) return res.status(403).json({ message: 'Not authorized' });

    const updated = await prisma.{entity_camel}.update({{
      where: {{ id }},
      data: req.body
    }});
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
"""

route_template = """const express = require('express');
const router = express.Router();
const controller = require('../controllers/{entity_camel}Controller');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', controller.create{entity_pascal});
router.get('/', controller.getCompany{entity_pascal}s);
router.put('/:id', controller.update{entity_pascal});

module.exports = router;
"""

for entity_camel, entity_pascal, _, _ in entities:
    controller_code = controller_template.format(entity_camel=entity_camel, entity_pascal=entity_pascal)
    route_code = route_template.format(entity_camel=entity_camel, entity_pascal=entity_pascal)
    
    with open(f'src/controllers/{entity_camel}Controller.js', 'w', encoding='utf-8') as f:
        f.write(controller_code)
        
    with open(f'src/routes/{entity_camel}Routes.js', 'w', encoding='utf-8') as f:
        f.write(route_code)

print("Generated controllers and routes.")

