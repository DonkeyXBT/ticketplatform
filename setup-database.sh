#!/bin/bash

echo "🎫 Ticket Platform - Database Setup Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your DATABASE_URL"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ Error: DATABASE_URL not found in .env file!"
    exit 1
fi

# Check if it's still the placeholder
if grep -q "postgresql://user:password@host:5432/dbname" .env; then
    echo "⚠️  Warning: DATABASE_URL looks like a placeholder!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://console.neon.tech/"
    echo "2. Create a new project"
    echo "3. Copy your connection string"
    echo "4. Update DATABASE_URL in .env file"
    echo ""
    echo "📖 See NEON_DATABASE_SETUP.md for detailed instructions"
    exit 1
fi

echo "✅ .env file found"
echo "✅ DATABASE_URL is set"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""

# Push database schema
echo "🚀 Setting up database tables..."
echo "This will create:"
echo "  - User table (authentication)"
echo "  - Account table (OAuth)"
echo "  - Session table (login sessions)"
echo "  - VerificationToken table (security)"
echo "  - Ticket table (your tickets with 18 fields)"
echo ""

npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Database setup completed successfully!"
    echo "================================================"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run dev"
    echo "  2. Open: http://localhost:3000"
    echo "  3. Sign in with Discord"
    echo "  4. Start adding tickets!"
    echo ""
    echo "Optional: Run 'npx prisma studio' to view your database"
else
    echo ""
    echo "❌ Database setup failed!"
    echo ""
    echo "Common issues:"
    echo "  - Check your internet connection"
    echo "  - Verify your DATABASE_URL is correct"
    echo "  - Make sure it ends with ?sslmode=require"
    echo "  - Check your Neon project is active"
    echo ""
    echo "📖 See NEON_DATABASE_SETUP.md for troubleshooting"
fi
