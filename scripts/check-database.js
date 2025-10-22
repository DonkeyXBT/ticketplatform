#!/usr/bin/env node

/**
 * Database Connection Check Script
 *
 * This script verifies:
 * 1. Database connection works
 * 2. All required tables exist
 * 3. Database is ready for NextAuth
 *
 * Run with: node scripts/check-database.js
 * Or with custom URL: DATABASE_URL="..." node scripts/check-database.js
 */

async function checkDatabase() {
  console.log('🔍 Checking database connection and tables...\n');

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('user:password@host')) {
    console.error('❌ DATABASE_URL is not set or contains placeholder values');
    console.error('Please set your Neon database URL in .env or as an environment variable\n');
    process.exit(1);
  }

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Test connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Check each table
    const tables = [
      { name: 'User', query: () => prisma.user.count() },
      { name: 'Account', query: () => prisma.account.count() },
      { name: 'Session', query: () => prisma.session.count() },
      { name: 'VerificationToken', query: () => prisma.verificationToken.findMany({ take: 1 }) },
      { name: 'Ticket', query: () => prisma.ticket.count() },
    ];

    console.log('Checking tables:');
    let allTablesExist = true;

    for (const table of tables) {
      try {
        const count = await table.query();
        const recordCount = typeof count === 'number' ? count : count.length;
        console.log(`  ✅ ${table.name.padEnd(20)} - EXISTS (${recordCount} records)`);
      } catch (error) {
        console.log(`  ❌ ${table.name.padEnd(20)} - MISSING or ERROR`);
        allTablesExist = false;
      }
    }

    await prisma.$disconnect();

    if (allTablesExist) {
      console.log('\n✨ All tables exist! Database is ready for authentication.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tables are missing. Run the initialization script:');
      console.log('   DATABASE_URL="your-neon-url" node scripts/init-database.js\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Database check failed:');
    console.error(error.message);
    console.error('\nPossible issues:');
    console.error('  - DATABASE_URL is incorrect');
    console.error('  - Database is not accessible');
    console.error('  - Tables have not been created yet');
    console.error('\nRun this to create tables:');
    console.error('  DATABASE_URL="your-neon-url" node scripts/init-database.js\n');
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabase();
