import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin2@hookahub.me';
const ADMIN_PASSWORD = 'Ivanadmin!';

async function main() {
  console.log(`🔍 Checking if user ${ADMIN_EMAIL} exists...`);

  const existingUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL }
  });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (existingUser) {
    console.log(`✨ User found. Resetting password and ensuring Admin role...`);
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: passwordHash,
        isAdmin: true
      }
    });
    console.log(`✅ Success: User ${updated.nombre} (${updated.email}) updated as Admin!`);
  } else {
    console.log(`➕ Creating new Admin user...`);
    const created = await prisma.user.create({
      data: {
        nombre: 'Admin Auxiliar',
        email: ADMIN_EMAIL,
        password: passwordHash,
        isAdmin: true,
        avatarUrl: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png'
      }
    });
    console.log(`✅ Success: Admin user ${created.nombre} (${created.email}) created!`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error executing script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
