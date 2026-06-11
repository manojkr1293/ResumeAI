import { PrismaClient } from '@prisma/client';
import env from './env';

// Prevent multiple instances of Prisma Client in development (hot-reloading)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaOptions = () => {
  if (env.NODE_ENV === 'development') {
    return {
      log: [
        { emit: 'event' as const, level: 'query' as const },
        { emit: 'stdout' as const, level: 'info' as const },
        { emit: 'stdout' as const, level: 'warn' as const },
        { emit: 'stdout' as const, level: 'error' as const },
      ],
    };
  }
  return {
    log: [
      { emit: 'stdout' as const, level: 'error' as const },
    ],
  };
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(getPrismaOptions());

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log queries in development mode
if (env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).$on('query', (e: any) => {
    // eslint-disable-next-line no-console
    console.log(`Query: ${e.query as string} | Params: ${e.params as string} | Duration: ${e.duration as number}ms`);
  });
}

// Graceful connection lifecycle handlers
export const connectDb = async (): Promise<void> => {
  try {
    await prisma.$connect();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Database connection failure:', error);
    process.exit(1);
  }
};

export const disconnectDb = async (): Promise<void> => {
  await prisma.$disconnect();
};

export default prisma;
