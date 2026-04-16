import { PrismaClient, Role, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'clothing' }, update: {}, create: { name: 'Одежда', slug: 'clothing', icon: '👕' } }),
    prisma.category.upsert({ where: { slug: 'shoes' }, update: {}, create: { name: 'Обувь', slug: 'shoes', icon: '👟' } }),
    prisma.category.upsert({ where: { slug: 'accessories' }, update: {}, create: { name: 'Аксессуары', slug: 'accessories', icon: '👜' } }),
  ]);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketplace.local' },
    update: {},
    create: {
      email: 'admin@marketplace.local',
      name: 'Admin',
      password: await bcrypt.hash('admin123', 10),
      role: Role.ADMIN,
    },
  });

  // Store
  const store = await prisma.store.upsert({
    where: { id: 'store-1' },
    update: {},
    create: {
      id: 'store-1',
      name: 'Flagship Store',
      address: 'ул. Примерная, 1',
      phone: '+7 999 000 00 00',
    },
  });

  // Sample products
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'p1',
        storeId: store.id,
        categoryId: categories[0].id,
        name: 'Базовая футболка',
        description: 'Классическая хлопковая футболка',
        price: 1200,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        brand: 'Basic',
        gender: Gender.UNISEX,
        images: [],
      },
      {
        id: 'p2',
        storeId: store.id,
        categoryId: categories[1].id,
        name: 'Кроссовки City Run',
        description: 'Лёгкие городские кроссовки',
        price: 4500,
        sizes: ['38', '39', '40', '41', '42', '43'],
        brand: 'RunCo',
        gender: Gender.UNISEX,
        images: [],
      },
    ],
  });

  console.log('Seed completed:', { admin: admin.email, store: store.name });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
