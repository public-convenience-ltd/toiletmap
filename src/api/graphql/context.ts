import { PrismaClient } from '@prisma/client';
import prisma from '../prisma/prisma';
import type { User } from '@auth0/nextjs-auth0/types';

export interface Context {
  prisma: PrismaClient;
  revalidate?: boolean;
  user?: User;
}

export const context: Context = {
  prisma: prisma,
};
