import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Connect the client
  await prisma.$connect();
  console.log(await prisma.newloos.findFirst());
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
