import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const brandsCount = await prisma.brand.count();
    console.log('Total Brands in DB:', brandsCount);
    
    if (brandsCount > 0) {
      const sampleBrands = await prisma.brand.findMany({
        take: 3,
        include: {
          tastes: {
            take: 2,
            include: {
              formats: true
            }
          }
        }
      });
      console.log('Sample Brands from DB:', JSON.stringify(sampleBrands, null, 2));
    }
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
