const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion',
      slug: 'fashion',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'wireless-headphones' },
    update: {},
    create: {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      priceRegular: 299,
      priceGroup: 199,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'smart-watch' },
    update: {},
    create: {
      name: 'Smart Watch',
      slug: 'smart-watch',
      priceRegular: 499,
      priceGroup: 349,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'running-shoes' },
    update: {},
    create: {
      name: 'Running Shoes',
      slug: 'running-shoes',
      priceRegular: 399,
      priceGroup: 279,
      categoryId: fashion.id,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
