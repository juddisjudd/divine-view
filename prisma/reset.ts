// prisma/reset.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all data in order to respect foreign key constraints
  console.log('Deleting all filters...');
  await prisma.filterTag.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.filter.deleteMany({});
  
  console.log('Deleting all users and auth data...');
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  
  // Keep tags - just in case we need them for re-seeding
  console.log('Database reset complete!');
}

main()
  .then(async () => {
    console.log('Database reset successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during database reset:', e);
    await prisma.$disconnect();
    process.exit(1);
  });