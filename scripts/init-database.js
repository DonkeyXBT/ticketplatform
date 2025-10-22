#!/usr/bin/env node

/**
 * Database Initialization Script
 *
 * This script:
 * 1. Verifies DATABASE_URL is set
 * 2. Pushes Prisma schema to database (creates tables)
 * 3. Verifies all tables were created
 *
 * Run this with your production DATABASE_URL:
 * DATABASE_URL="your-neon-url" node scripts/init-database.js
 */

const { execSync } = require('child_process');

console.log('🚀 Starting database initialization...\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('user:password@host')) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set or contains placeholder values');
  console.error('\nPlease run this script with your Neon database URL:');
  console.error('DATABASE_URL="postgresql://..." node scripts/init-database.js\n');
  process.exit(1);
}

console.log('✅ DATABASE_URL is set');
console.log(`📍 Database: ${process.env.DATABASE_URL.split('@')[1]?.split('?')[0] || 'unknown'}\n`);

try {
  console.log('📦 Step 1: Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated\n');

  console.log('🔨 Step 2: Pushing schema to database (creating tables)...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Schema pushed to database\n');

  console.log('🔍 Step 3: Verifying database setup...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  // Try to query each table
  const verifications = [
    { name: 'User', fn: () => prisma.user.findMany({ take: 1 }) },
    { name: 'Account', fn: () => prisma.account.findMany({ take: 1 }) },
    { name: 'Session', fn: () => prisma.session.findMany({ take: 1 }) },
    { name: 'VerificationToken', fn: () => prisma.verificationToken.findMany({ take: 1 }) },
    { name: 'Ticket', fn: () => prisma.ticket.findMany({ take: 1 }) },
  ];

  async function verifyTables() {
    for (const { name, fn } of verifications) {
      try {
        await fn();
        console.log(`  ✅ ${name} table exists and is accessible`);
      } catch (error) {
        console.error(`  ❌ ${name} table verification failed:`, error.message);
        throw error;
      }
    }
    await prisma.$disconnect();
  }

  verifyTables()
    .then(() => {
      console.log('\n✨ SUCCESS! Database is fully initialized and ready');
      console.log('\nAll NextAuth tables created:');
      console.log('  - User (for user accounts)');
      console.log('  - Account (for OAuth providers)');
      console.log('  - Session (for authentication sessions)');
      console.log('  - VerificationToken (for NextAuth verification)');
      console.log('  - Ticket (for ticket management)');
      console.log('\n🎉 You can now deploy to Vercel and authentication should work!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database verification failed');
      console.error(error);
      process.exit(1);
    });

} catch (error) {
  console.error('\n❌ Database initialization failed');
  console.error(error.message);
  process.exit(1);
}
