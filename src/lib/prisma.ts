import { PrismaClient } from '@prisma/client';

// Prisma Client with connection pooling and better error handling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
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

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error.message);
    console.error('   Make sure PostgreSQL is running and DATABASE_URL is correct');
    console.error('   DATABASE_URL format: postgresql://user:password@localhost:5432/database');
  });

export default prisma;





