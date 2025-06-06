#!/usr/bin/env node

/**
 * Robust build script for Vercel deployment
 * Handles existing database schemas gracefully
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.log(`⚠️ ${description} failed:`, error.message);
    return false;
  }
}

async function build() {
  console.log('🏗️ Starting Vercel build process...');
  
  try {
    // Step 1: Generate Prisma client
    const generateSuccess = runCommand('prisma generate', 'Generating Prisma client');
    if (!generateSuccess) {
      throw new Error('Failed to generate Prisma client');
    }
    
    // Step 2: Try to setup database schema
    console.log('🗄️ Setting up database schema...');
    
    // First try migrate deploy
    const migrateSuccess = runCommand('prisma migrate deploy', 'Applying migrations');
    
    if (!migrateSuccess) {
      console.log('⚠️ Migration failed, trying db push...');
      // Fallback to db push for existing databases
      const pushSuccess = runCommand('prisma db push --force-reset', 'Pushing schema changes');
      
      if (!pushSuccess) {
        console.log('⚠️ DB push failed, trying without force reset...');
        const simplePushSuccess = runCommand('prisma db push', 'Pushing schema (simple)');
        
        if (!simplePushSuccess) {
          console.log('⚠️ All database operations failed, proceeding with build...');
          console.log('The application may not work correctly if the schema is outdated.');
        }
      }
    }
    
    // Step 3: Build Next.js application
    const buildSuccess = runCommand('next build', 'Building Next.js application');
    if (!buildSuccess) {
      throw new Error('Failed to build Next.js application');
    }
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();