import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing tobacco tables...');
    await prisma.tasteFormat.deleteMany();
    await prisma.taste.deleteMany();
    await prisma.brand.deleteMany();
    console.log('✅ Tobacco tables cleared successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
