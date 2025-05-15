// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Add global prisma type declaration
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a global prisma instance to prevent multiple instances in development
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
