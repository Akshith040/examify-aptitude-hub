# Neon PostgreSQL Setup Guide

## Step 1: Create Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" and create account with GitHub/Google/Email
3. No credit card required for free tier

## Step 2: Create New Project

1. Click "Create Project"
2. **Project Name**: `examify-aptitude-hub`
3. **Database Name**: `examify_db`
4. **Region**: Choose closest to your users (US East, EU West, etc.)
5. **PostgreSQL Version**: 15 (recommended)
6. Click "Create Project"

## Step 3: Get Connection Details

After project creation, you'll see:

### Connection String Format
```
postgresql://[username]:[password]@[hostname]/[database]?sslmode=require
```

### Example Connection Details
```
Host: ep-cool-math-123456.us-east-1.aws.neon.tech
Database: examify_db
Username: examify_user
Password: [generated-password]
```

### Environment Variables Needed
```bash
# Database Connection
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
DIRECT_URL="postgresql://username:password@hostname/database?sslmode=require"

# For Prisma (if using)
POSTGRES_PRISMA_URL="postgresql://username:password@hostname/database?sslmode=require&pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://username:password@hostname/database?sslmode=require"
```

## Step 4: Configure Database Access

### Enable Connection Pooling
1. In Neon Console, go to "Settings" → "Connection Pooling"
2. Enable pooling for better performance
3. Note the pooled connection string

### Set Up IP Allowlist (Optional)
1. Go to "Settings" → "IP Allow"
2. Add your application's IP addresses
3. For development, you can allow all IPs (0.0.0.0/0)

## Step 5: Test Connection

### Using psql (Command Line)
```bash
psql "postgresql://username:password@hostname/database?sslmode=require"
```

### Using Node.js
```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Connected successfully:', result.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();
```

## Step 6: Database Configuration

### Create .env.local file
```bash
# Neon PostgreSQL Database
DATABASE_URL="your-neon-connection-string"
DIRECT_URL="your-neon-connection-string"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Application Settings
NODE_ENV="development"
```

### Update package.json dependencies
```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "@types/pg": "^8.10.9",
    "next-auth": "^4.24.5",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## Step 7: Install Required Packages

```bash
npm install pg @types/pg next-auth bcryptjs @types/bcryptjs
```

## Step 8: Create Database Client

### lib/db.ts
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export { pool };

// Helper function for queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
```

## Step 9: Verify Setup

### Test Database Connection
```typescript
// test-db.ts
import { query } from './lib/db';

async function testDatabase() {
  try {
    const result = await query('SELECT version()');
    console.log('Database connected:', result.rows[0].version);
    
    // Test table creation
    await query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('Test table created successfully');
    
    // Clean up
    await query('DROP TABLE IF EXISTS test_table');
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase();
```

## Step 10: Neon-Specific Features

### Database Branching
```bash
# Create a branch for development
neonctl branches create --name development

# Switch between branches
neonctl branches list
```

### Monitoring
1. Go to Neon Console → "Monitoring"
2. View connection metrics
3. Monitor query performance
4. Check storage usage

### Backups
- **Automatic**: Point-in-time recovery (7 days retention)
- **Manual**: Export via pg_dump
- **Branching**: Create branches for testing

## Troubleshooting

### Common Issues

#### Connection Timeout
```typescript
// Increase timeout in connection string
const connectionString = `${process.env.DATABASE_URL}&connect_timeout=60`;
```

#### SSL Certificate Issues
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // For development
    // For production, use proper certificates
  }
});
```

#### Connection Pool Exhaustion
```typescript
// Monitor pool status
pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});
```

### Performance Optimization

#### Connection Pooling
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  min: 5,  // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Query Optimization
```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tests_active ON scheduled_tests(is_active);
```

## Security Best Practices

### Environment Variables
- Never commit connection strings to git
- Use different databases for development/production
- Rotate passwords regularly

### Connection Security
- Always use SSL in production
- Implement connection pooling
- Monitor for unusual connection patterns

### Access Control
- Use least-privilege principle
- Create separate users for different applications
- Regularly audit database access

## Next Steps

1. ✅ Neon account created
2. ✅ Database project set up
3. ✅ Connection tested
4. ⏳ Run schema migration scripts
5. ⏳ Import data
6. ⏳ Update application code
7. ⏳ Deploy and test

## Support Resources

- **Neon Documentation**: [https://neon.tech/docs](https://neon.tech/docs)
- **PostgreSQL Documentation**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **Community Support**: Neon Discord/GitHub
- **Status Page**: [https://status.neon.tech](https://status.neon.tech)