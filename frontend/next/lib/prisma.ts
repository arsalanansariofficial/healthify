import { PrismaClient } from '@prisma/client';

import { ENVIRONMENT } from '@/lib/constants';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (!ENVIRONMENT.IS_PRODUCTION) globalForPrisma.prisma = prisma;

export default prisma;
