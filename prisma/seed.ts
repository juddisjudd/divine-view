import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'Leveling' },
      update: {},
      create: { name: 'Leveling' },
    }),
    prisma.tag.upsert({
      where: { name: 'Intermediate' },
      update: {},
      create: { name: 'Intermediate' },
    }),
    prisma.tag.upsert({
      where: { name: 'Endgame' },
      update: {},
      create: { name: 'Endgame' },
    }),
    prisma.tag.upsert({
      where: { name: 'Cosmetic Only' },
      update: {},
      create: { name: 'Cosmetic Only' },
    }),
    prisma.tag.upsert({
      where: { name: 'Semi-Strict' },
      update: {},
      create: { name: 'Semi-Strict' },
    }),
    prisma.tag.upsert({
        where: { name: 'Strict' },
        update: {},
        create: { name: 'Strict' },
    }),
    prisma.tag.upsert({
        where: { name: 'VeryStrict' },
        update: {},
        create: { name: 'VeryStrict' },
    }),
    prisma.tag.upsert({
        where: { name: 'UberStrict' },
        update: {},
        create: { name: 'UberStrict' },
    }),
    prisma.tag.upsert({
        where: { name: 'Hardcore' },
        update: {},
        create: { name: 'Hardcore' },
    }),
    prisma.tag.upsert({
        where: { name: 'Softcore' },
        update: {},
        create: { name: 'Softcore' },
    }),
  ]);

  console.log({ tags });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });