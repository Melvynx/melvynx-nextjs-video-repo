// lib/prisma.
import { PrismaClient } from "@/lib/generated/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
