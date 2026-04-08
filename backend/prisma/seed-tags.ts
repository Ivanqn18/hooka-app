import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TAGS = [
    'refrescante',
    'afrutada',
    'dulce',
    'mentolada',
    'fuerte',
    'suave',
    'tropical',
    'cítrica',
    'especiada',
    'floral',
    'exótica',
    'clásica',
];

async function seedTags() {
    console.log('🏷️  Seeding tags...');

    for (const nombre of TAGS) {
        await prisma.tag.upsert({
            where: { nombre },
            update: {},
            create: { nombre },
        });
    }

    const count = await prisma.tag.count();
    console.log(`✅ ${count} tags en la base de datos.`);
}

seedTags()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
