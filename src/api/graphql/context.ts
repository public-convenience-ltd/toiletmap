import { PrismaClient } from '@prisma/client';
import prisma from '../prisma/prisma';

// Type for JWT-authenticated user
export interface JWTUser {
  sub?: string;
  [key: string]: unknown;
}

export interface Context {
  prisma: PrismaClient;
  revalidate?: boolean;
  user?: JWTUser;
}

export const context: Context = {
  prisma: prisma,
};
