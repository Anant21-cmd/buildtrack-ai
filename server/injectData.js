const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  try {
    const atoz = await prisma.company.findFirst({ where: { name: 'ATOZ' } });
    if (!atoz) return console.log('ATOZ company not found!');

    console.log('Found ATOZ company:', atoz.id);

    const hash = await bcrypt.hash('password123', 10);

    // 1. Create 4 Valid Users (Making 5 total with the admin)
    const users = [
      { email: 'engineer@atoz.com', name: 'Arun Kumar', role: 'SITE_ENGINEER' },
      { email: 'store@atoz.com', name: 'Priya Sharma', role: 'STORE_MANAGER' },
      { email: 'contractor@atoz.com', name: 'Vikram Singh', role: 'CONTRACTOR' },
      { email: 'client@atoz.com', name: 'Global Tech Corp', role: 'CLIENT' }
    ];

    for (let u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          ...u,
          password: hash,
          isEmailVerified: true,
          companyId: atoz.id
        }
      });
    }
    console.log('Created 4 valid users.');

    // 2. Create Valid Projects
    const p1 = await prisma.project.create({
      data: {
        name: 'Greenfield Tech Park (Phase 1)',
        description: 'Construction of a 5-story IT park building with smart energy management.',
        location: 'Cyber City, Plot 45',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2027-12-30'),
        budget: 5000000,
        spent: 1200000,
        status: 'ACTIVE',
        companyId: atoz.id
      }
    });

    const p2 = await prisma.project.create({
      data: {
        name: 'Highway 44 Overpass Bridge',
        description: 'Reinforced concrete bridge overpass connecting major national highways.',
        location: 'NH-44 Junction',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-10-15'),
        budget: 2500000,
        spent: 2450000,
        status: 'COMPLETED',
        companyId: atoz.id
      }
    });
    console.log('Created valid projects.');

    // 3. Create Valid Materials
    await prisma.material.createMany({
      data: [
        { name: 'UltraTech Portland Cement', category: 'CEMENT', stock: 800, minThreshold: 100, unit: 'Bags', companyId: atoz.id },
        { name: 'Tata Tiscon TMT Steel 16mm', category: 'STEEL', stock: 150, minThreshold: 20, unit: 'Tons', companyId: atoz.id },
        { name: 'Premium River Sand', category: 'AGGREGATES', stock: 300, minThreshold: 50, unit: 'Cubic Meters', companyId: atoz.id },
        { name: 'Red Clay Bricks (Grade A)', category: 'BRICKS', stock: 15000, minThreshold: 2000, unit: 'Pieces', companyId: atoz.id }
      ]
    });
    console.log('Created valid materials.');

    // 4. Create Valid Workers
    await prisma.worker.createMany({
      data: [
        { name: 'Ramesh Patel', trade: 'MASON', badgeId: 'WORKER-1001', status: 'Active', companyId: atoz.id },
        { name: 'Manoj Tiwari', trade: 'ELECTRICIAN', badgeId: 'WORKER-1002', status: 'Active', companyId: atoz.id },
        { name: 'Sunita Devi', trade: 'LABORER', badgeId: 'WORKER-1003', status: 'Active', companyId: atoz.id }
      ]
    });
    console.log('Created valid workers.');

    // 5. Delete the fake Apex company to satisfy Constraint 9
    const apex = await prisma.company.findFirst({ where: { name: 'Apex Builders' } });
    if (apex) {
      // Need to delete related users first
      await prisma.user.deleteMany({ where: { companyId: apex.id } });
      await prisma.material.deleteMany({ where: { companyId: apex.id } });
      await prisma.worker.deleteMany({ where: { companyId: apex.id } });
      await prisma.project.deleteMany({ where: { companyId: apex.id } });
      await prisma.company.delete({ where: { id: apex.id } });
      console.log('Deleted Apex Builders sample data.');
    }

    console.log('Data injection complete!');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
