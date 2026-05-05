import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminUser = await prisma.user.findFirst({
        where: { isAdmin: true },
    });

    if (adminUser) {
        console.log(JSON.stringify({ exists: true, user: { email: adminUser.email, nombre: adminUser.nombre } }, null, 2));
    } else {
        console.log(JSON.stringify({ exists: false }, null, 2));
        
        // Create one just in case
        const adminHash = await bcrypt.hash('Admin123', 10);
        const newAdmin = await prisma.user.create({
            data: {
                nombre: 'Administrador Sistema',
                email: 'admin@hookaapp.com',
                password: adminHash,
                isAdmin: true,
                avatarUrl: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png',
            },
        });
        console.log("CREATED_NEW_ADMIN", newAdmin.email);
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
