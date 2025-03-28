import { PrismaClient } from '@prisma/client';
import prisma from '../prisma/prisma';
import type { UserProfile } from 'auth0';

export interface Context {
  prisma: PrismaClient;
  revalidate?: boolean;
  user?: UserProfile;
}

export const context: Context = {
  prisma: prisma,
};
