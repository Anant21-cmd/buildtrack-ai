const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMarketPrices() {
  console.log('Seeding market prices...');
  
  await prisma.materialMarketPrice.deleteMany({});
  
  const prices = [
    {
      materialName: 'Cement',
      brand: 'UltraTech',
      specification: 'PPC 53 Grade',
      unit: '50 kg bag',
      price: 420.0,
      minPrice: 410.0,
      maxPrice: 430.0,
      city: 'Madurai',
      state: 'Tamil Nadu',
      sourceName: 'Local Market Average',
      status: 'FRESH'
    },
    {
      materialName: 'TMT Steel',
      brand: 'Tata Tiscon',
      specification: 'Fe 550D',
      unit: '1 kg',
      price: 68.5,
      minPrice: 67.0,
      maxPrice: 70.0,
      city: 'Madurai',
      state: 'Tamil Nadu',
      sourceName: 'SteelTrade India',
      status: 'RECENTLY_UPDATED'
    },
    {
      materialName: 'Red Brick',
      brand: 'Standard Chamber',
      specification: 'Class A',
      unit: '1 piece',
      price: 9.0,
      minPrice: 8.5,
      maxPrice: 9.5,
      city: 'Madurai',
      state: 'Tamil Nadu',
      sourceName: 'Supplier Network',
      status: 'FRESH'
    },
    {
      materialName: 'M-Sand',
      brand: 'Generic',
      specification: 'Concrete Grade',
      unit: '1 unit (100 cft)',
      price: 4500.0,
      minPrice: 4200.0,
      maxPrice: 4800.0,
      city: 'Madurai',
      state: 'Tamil Nadu',
      sourceName: 'Sand Suppliers Assoc.',
      status: 'FRESH'
    }
  ];

  for (const p of prices) {
    const created = await prisma.materialMarketPrice.create({ data: p });
    
    // Add history
    await prisma.materialPriceHistory.create({
      data: {
        marketPriceId: created.id,
        price: p.price * 0.98, // Mock slightly lower previous price
        unit: p.unit,
        city: p.city,
        district: 'Madurai',
        state: p.state,
        country: 'India',
        sourceName: p.sourceName,
        retrievedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    });
  }
  
  console.log('Seeded successfully!');
}

seedMarketPrices()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

