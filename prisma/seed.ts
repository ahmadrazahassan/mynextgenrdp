import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding the database...')

  // Create admin user
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nextgenrdp.com' },
    update: {},
    create: {
      email: 'admin@nextgenrdp.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      emailVerified: true,
      isAdmin: true,
    },
  })
  console.log('Admin created:', admin.id)

  // Create a regular user
  const userPassword = await hash('password123', 10)
    const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
      update: {},
      create: {
      email: 'user@example.com',
      passwordHash: userPassword,
      fullName: 'Test User',
      emailVerified: true,
      isAdmin: false,
    },
  })
  console.log(`User created: ${user.id}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 