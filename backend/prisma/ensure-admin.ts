import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_CONFIG = {
    nombre: 'Administrador Sistema',
    email: 'quintananietoivan@gmail.com', // Cambia esto si quieres otro correo
    password: 'ImIvans18',        // Cambia esto si quieres otra contraseña
    avatarUrl: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png',
};

async function main() {
    console.log(`🔍 Buscando usuario con email: ${ADMIN_CONFIG.email}...`);

    // 1. Intentar buscar por el email configurado
    const userByEmail = await prisma.user.findUnique({
        where: { email: ADMIN_CONFIG.email },
    });

    const adminHash = await bcrypt.hash(ADMIN_CONFIG.password, 10);

    if (userByEmail) {
        console.log('✨ Usuario encontrado. Promocionando a Administrador y actualizando...');
        await prisma.user.update({
            where: { id: userByEmail.id },
            data: {
                nombre: ADMIN_CONFIG.nombre,
                password: adminHash,
                isAdmin: true,
                avatarUrl: ADMIN_CONFIG.avatarUrl,
            },
        });
        console.log('✅ Usuario promocionado con éxito:', ADMIN_CONFIG.email);
    } else {
        // 2. Si no existe por email, buscar si hay algún otro admin para actualizarlo
        console.log('❓ Usuario no encontrado por email. Buscando cualquier otro admin...');
        const anyAdmin = await prisma.user.findFirst({
            where: { isAdmin: true },
        });

        if (anyAdmin) {
            console.log('✨ Otro administrador encontrado. Actualizando sus credenciales...');
            await prisma.user.update({
                where: { id: anyAdmin.id },
                data: {
                    nombre: ADMIN_CONFIG.nombre,
                    email: ADMIN_CONFIG.email,
                    password: adminHash,
                    avatarUrl: ADMIN_CONFIG.avatarUrl,
                },
            });
            console.log('✅ Admin actualizado con éxito:', ADMIN_CONFIG.email);
        } else {
            // 3. Si no hay nada, crear uno nuevo
            console.log('➕ No hay ni usuario con ese email ni administradores. Creando nuevo...');
            await prisma.user.create({
                data: {
                    ...ADMIN_CONFIG,
                    password: adminHash,
                    isAdmin: true,
                },
            });
            console.log('✅ Nuevo admin creado con éxito:', ADMIN_CONFIG.email);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
