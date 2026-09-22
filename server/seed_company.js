const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 1. Create a Company
  const company = await prisma.company.create({
    data: {
      name: 'Apex Builders & Construction',
      regNumber: 'APEX-998877',
      address: '123 Skyline Blvd, Tech District',
      phone: '+91-9876543210',
      email: 'contact@apexbuilders.com',
      ownerName: 'Anand (Company Admin)',
      status: 'APPROVED',
      documentsSubmitted: ['registration.pdf', 'tax_id.pdf']
    }
  });

  // 2. Create the Company Admin user
  const hashedPassword = await bcrypt.hash('lathianand', 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Anand (Company Admin)',
      email: 'admin@apexbuilders.com',
      password: hashedPassword,
      role: 'COMPANY_ADMIN',
      avatar: 'AB',
      companyId: company.id
    }
  });

  console.log('Successfully created company and admin!');
  console.log('Email:', user.email);
  console.log('Password: lathianand');
}

main().catch(console.error).finally(() => prisma.$disconnect());
