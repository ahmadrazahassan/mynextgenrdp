// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Define a global type for the Prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Error message template for missing DATABASE_URL
const DATABASE_URL_MISSING = `
⚠️ DATABASE_URL is missing in environment variables
Make sure you have a .env or .env.local file with DATABASE_URL defined.
For local development, you can use:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nextgenweb?schema=public"
`;

// Function to create and configure a Prisma client
function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn(DATABASE_URL_MISSING);
    
    // Use a fallback URL for development (localhost)
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/nextgenweb?schema=public";
  }
  
  // Create new PrismaClient with logging in development
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
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
