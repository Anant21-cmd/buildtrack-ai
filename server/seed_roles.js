const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({
    where: { name: 'Apex Builders & Construction' }
  });

  if (!company) {
    console.log('Company not found. Run seed_company.js first.');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    { name: 'Sam (Site Engineer)', email: 'engineer@apex.com', role: 'SITE_ENGINEER' },
    { name: 'Sarah (Store Manager)', email: 'store@apex.com', role: 'STORE_MANAGER' },
    { name: 'Chris (Contractor)', email: 'contractor@apex.com', role: 'CONTRACTOR' },
    { name: 'Chloe (Client)', email: 'client@apex.com', role: 'CLIENT' }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        companyId: company.id
      }
    });
  }

  console.log('Successfully created test role accounts!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
