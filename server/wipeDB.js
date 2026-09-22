const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Starting full database wipe...');
    
    // Delete in order of dependencies (children first)
    await prisma.dailyProgress.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.materialRequest.deleteMany({});
    await prisma.projectMaterialAllocation.deleteMany({});
    
    await prisma.vendor.deleteMany({});
    await prisma.material.deleteMany({});
    await prisma.worker.deleteMany({});
    await prisma.project.deleteMany({});
    
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
    
    console.log('DATABASE COMPLETELY WIPED! All tables are empty.');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

