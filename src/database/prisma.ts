// src/lib/prisma.ts
import { PrismaClient } from '../../prisma/generated/prisma';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? [] : ["query"],
})
