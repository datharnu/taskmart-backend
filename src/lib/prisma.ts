import { PrismaClient } from '@prisma/client';

// Enhanced Prisma Client with better connection handling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pool settings to prevent connection timeouts
  // These settings help maintain stable connections
});

// Handle connection errors and reconnect
prisma.$on('error' as never, (e: { message: string; target: string }) => {
  console.error('❌ Prisma error:', e.message);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Test database connection on startup with retry logic
async function connectWithRetry(retries = 3, delay = 2000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connection established');
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to connect to database (attempt ${i + 1}/${retries}):`, errorMessage);
      
      if (i < retries - 1) {
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('   Make sure PostgreSQL is running and DATABASE_URL is correct');
        console.error('   DATABASE_URL format: postgresql://user:password@localhost:5432/database');
        console.error('   For connection pooling, add: ?connection_limit=10&pool_timeout=20');
        throw error;
      }
    }
  }
}

// Connect on startup
connectWithRetry().catch((error) => {
  console.error('Failed to establish database connection after retries');
});

export default prisma;





