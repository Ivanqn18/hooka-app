import { PrismaClient, ProductCategory, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando la creación de datos de prueba...');

    // Limpiar la base de datos (orden correcto: hijos primero, padres después)
    console.log('🧹 Limpiando base de datos...');
    await prisma.notification.deleteMany();
    await prisma.mixTag.deleteMany();
    await prisma.mixComment.deleteMany();
    await prisma.mixDislike.deleteMany();
    await prisma.mixLike.deleteMany();
    await prisma.mixIngredient.deleteMany();
    await prisma.mix.deleteMany();
    await prisma.userStash.deleteMany();
    await prisma.sellerReview.deleteMany();
    await prisma.message.deleteMany();
    await prisma.chat.deleteMany();
    await prisma.barReview.deleteMany();
    await prisma.bar.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();


    // 1. Crear Usuarios
    console.log('👤 Creando usuarios...');
    const passwordHash = await bcrypt.hash('123456', 10);
    const adminHash = await bcrypt.hash('Admin123', 10);

    const admin = await prisma.user.create({
        data: {
            nombre: 'Iván Administrador',
            email: 'ivan@admin.com',
            password: adminHash,
            isAdmin: true,
            avatarUrl: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png',
        },
    });

    const juan = await prisma.user.create({
        data: {
            nombre: 'Juan Perez',
            email: 'juan@example.com',
            password: passwordHash,
            avatarUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        },
    });

    const maria = await prisma.user.create({
        data: {
            nombre: 'Maria Lopez',
            email: 'maria@example.com',
            password: passwordHash,
            avatarUrl: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        },
    });

    // 2. Crear Mezclas (Mixes)
    console.log('💨 Creando mezclas de shisha...');
    const mezcla1 = await prisma.mix.create({
        data: {
            titulo: 'Menta Fresca Intensa',
            autorId: juan.id,
            ingredients: {
                create: [
                    { nombreTabaco: 'Cane Mint', marca: 'Tangiers', porcentaje: 40 },
                    { nombreTabaco: 'Love 66', marca: 'Adalya', porcentaje: 60 }
                ]
            },
            likes: {
                create: [{ usuarioId: maria.id }]
            }
        }
    });

    const mezcla2 = await prisma.mix.create({
        data: {
            titulo: 'Dulce de Leche y Vainilla',
            autorId: maria.id,
            ingredients: {
                create: [
                    { nombreTabaco: 'Dulce de Leche', marca: 'Hookain', porcentaje: 70 },
                    { nombreTabaco: 'Vanilla', marca: 'Al Fakher', porcentaje: 30 }
                ]
            },
            dislikes: {
                create: [{ usuarioId: juan.id }]
            }
        }
    });

    // 3. Crear Productos del Mercadillo
    console.log('🛍️ Creando productos en venta...');
    await prisma.product.create({
        data: {
            titulo: 'Cachimba MR Shisha Rocket 2.0',
            descripcion: 'Vendo mi cachimba porque apenas la uso. Está en perfecto estado, incluyo base.',
            precio: 65.50,
            categoria: ProductCategory.CACHIMBA,
            estado: ProductStatus.DISPONIBLE,
            vendedorId: juan.id,
            imagenUrl: 'https://m.media-amazon.com/images/I/51AOhn1F35L._AC_SX679_.jpg'
        }
    });

    await prisma.product.create({
        data: {
            titulo: 'Cazoleta HC Black Edition',
            descripcion: 'Cazoleta de barro negro con borde sin esmaltar. Usada 2 veces.',
            precio: 12.00,
            categoria: ProductCategory.CAZOLETA,
            estado: ProductStatus.DISPONIBLE,
            vendedorId: maria.id,
            imagenUrl: 'https://www.bengalaspain.com/34825-thickbox_default/cazoleta-hc-black-edition.jpg'
        }
    });

    // 4. Crear Bares de Shisha (Mapa)
    console.log('📍 Creando bares...');
    await prisma.bar.create({
        data: {
            nombre: 'Medusa Shisha Lounge',
            descripcion: 'El mejor bar de Madrid para fumar tranquilamente con unos cócteles.',
            direccion: 'Calle de los Ejemplos 123, Madrid',
            latitud: 40.4168,
            longitud: -3.7038,
            imagenUrl: 'https://images.unsplash.com/photo-1542282243-d3acbb25fc49',
            reviews: {
                create: [
                    { usuarioId: juan.id, puntuacion: 5, comentario: 'Sitio espectacular, me encantaron las cazoletas preparadas' }
                ]
            }
        }
    });

    await prisma.bar.create({
        data: {
            nombre: 'Cairo Hookah Club',
            descripcion: 'Un local con estilo tradicional pero caídas de agua modernas. Gran variedad de tabacos rubios y oscuros.',
            direccion: 'Avenida Paralelo 50, Barcelona',
            latitud: 41.3758,
            longitud: 2.1644,
            reviews: {
                create: [
                    { usuarioId: maria.id, puntuacion: 4, comentario: 'Muy buen ambiente, un poco ruidoso en fin de semana.' }
                ]
            }
        }
    });

    console.log('✅ Base de datos poblada (' + '\x1b[32m' + 'Éxito' + '\x1b[0m' + ').');
}

main()
    .catch((e) => {
        console.error('❌ Error poblado la base de datos:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
