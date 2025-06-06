// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Define a global type for the Prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Function to create and configure a Prisma client
function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(`
⚠️ DATABASE_URL is missing in environment variables
Make sure you have a .env or .env.local file with DATABASE_URL defined.
For local development, you can use:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nextgenweb?schema=public"
`);
  }
  
  // Create new PrismaClient with appropriate logging
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    // Add connection pool settings for production
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Add error handler
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error) {
      console.error(`Prisma Error [${params.model}.${params.action}]:`, error);
      throw error;
    }
  });

  return client;
}

// Create singleton Prisma instance
let prisma: PrismaClient;

// In production, create a new instance
if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // In development, use global variable to prevent multiple instances during hot-reloading
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

// Export the prisma client
export default prisma;
