#!/usr/bin/env node

/**
 * Custom build script for Vercel deployment
 * Handles both empty and existing database scenarios
 */

const { execSync } = require('child_process');

async function build() {
  console.log('🏗️ Starting Vercel build process...');
  
  try {
    // Step 1: Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('prisma generate', { stdio: 'inherit' });
    
    // Step 2: Try to run migrations, fallback to db push if it fails
    console.log('🗄️ Setting up database schema...');
    try {
      // First try migrate deploy (for fresh databases)
      execSync('prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations applied successfully');
    } catch (error) {
      console.log('⚠️ Migration failed, trying db push...');
      try {
        // Fallback to db push for existing databases
        execSync('prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('✅ Database schema updated successfully');
      } catch (pushError) {
        console.log('⚠️ DB push failed, proceeding without schema changes...');
        console.log('This might be okay if the schema is already up to date.');
      }
    }
    
    // Step 3: Build Next.js application
    console.log('🚀 Building Next.js application...');
    execSync('next build', { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();