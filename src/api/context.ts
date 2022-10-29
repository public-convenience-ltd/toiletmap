import { PrismaClient } from '@prisma/client';
import { UserProfile } from '@auth0/nextjs-auth0';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  revalidate?: boolean;
  user?: UserProfile;
}

export const context: Context = {
  prisma: prisma,
};
