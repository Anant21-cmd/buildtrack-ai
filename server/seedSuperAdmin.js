const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    
    // Check if user already exists just in case
    const existing = await prisma.user.findUnique({ where: { email: '6382069963a@gmail.com' } });
    if (existing) {
      console.log('User already exists, updating to SUPER_ADMIN...');
      await prisma.user.update({
        where: { email: '6382069963a@gmail.com' },
        data: { role: 'SUPER_ADMIN', password: hash }
      });
    } else {
      await prisma.user.create({
        data: {
          email: '6382069963a@gmail.com',
          name: 'Super Admin',
          password: hash,
          role: 'SUPER_ADMIN',
          isEmailVerified: true
        }
      });
    }
    
    console.log('Super Admin account successfully created!');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

