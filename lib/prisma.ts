import { PrismaClient } from '@prisma/client';
import { IS_PRODUCTION } from '@/lib/constants';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (!IS_PRODUCTION) globalForPrisma.prisma = prisma;

export default prisma;
