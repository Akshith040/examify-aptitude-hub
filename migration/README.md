# Examify Database Migration Guide

## Overview

This directory contains all the necessary files and scripts to migrate your Examify application from Supabase to a free Neon PostgreSQL database.

## 📁 Directory Structure

```
migration/
├── README.md                    # This file
├── 01-database-analysis.md      # Complete database analysis
├── 02-migration-plan.md         # Detailed migration strategy
├── 03-neon-setup.md            # Neon PostgreSQL setup guide
├── 04-application-updates.md    # Code changes required
├── sql/
│   ├── 01-create-schema.sql    # Database schema creation
│   └── 02-seed-data.sql        # Sample data insertion
└── scripts/
    ├── migrate.sh              # Main migration script
    ├── backup.sh               # Database backup script
    └── restore.sh              # Database restore script
```

## 🚀 Quick Start

### 1. Set Up Neon Database

1. Follow the instructions in `03-neon-setup.md`
2. Create your Neon account and database
3. Get your connection string

### 2. Run Migration

```bash
# Make scripts executable
chmod +x migration/scripts/*.sh

# Set your database URL
export DATABASE_URL="your-neon-connection-string"

# Run the migration
./migration/scripts/migrate.sh
```

### 3. Update Application Code

Follow the instructions in `04-application-updates.md` to update your application code.

## 📋 Step-by-Step Migration

### Phase 1: Database Setup (30 minutes)

1. **Read the Analysis**
   ```bash
   cat migration/01-database-analysis.md
   ```

2. **Set Up Neon Database**
   ```bash
   # Follow the guide
   cat migration/03-neon-setup.md
   ```

3. **Test Connection**
   ```bash
   psql "$DATABASE_URL" -c "SELECT version();"
   ```

### Phase 2: Schema Migration (15 minutes)

1. **Create Schema**
   ```bash
   psql "$DATABASE_URL" -f migration/sql/01-create-schema.sql
   ```

2. **Verify Schema**
   ```bash
   psql "$DATABASE_URL" -c "\dt"  # List tables
   ```

### Phase 3: Data Migration (15 minutes)

1. **Insert Sample Data**
   ```bash
   psql "$DATABASE_URL" -f migration/sql/02-seed-data.sql
   ```

2. **Verify Data**
   ```bash
   psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM questions;"
   ```

### Phase 4: Application Updates (60 minutes)

1. **Install Dependencies**
   ```bash
   npm install pg @types/pg next-auth bcryptjs @types/bcryptjs
   npm uninstall @supabase/supabase-js
   ```

2. **Update Code**
   - Follow `04-application-updates.md`
   - Replace Supabase client with PostgreSQL client
   - Implement NextAuth.js authentication

3. **Update Environment Variables**
   ```bash
   cp .env.local .env.local.backup
   # Update .env.local with new DATABASE_URL
   ```

### Phase 5: Testing (30 minutes)

1. **Test Database Connection**
   ```bash
   npm run dev
   # Check if app connects to database
   ```

2. **Test Authentication**
   - Try login/signup flows
   - Verify role-based access

3. **Test Core Features**
   - Question management
   - Test scheduling
   - Taking tests
   - Viewing results

## 🛠 Scripts Usage

### Migration Script
```bash
# Full migration with all steps
./migration/scripts/migrate.sh

# Check logs
tail -f migration/migration.log
```

### Backup Script
```bash
# Create backup
./migration/scripts/backup.sh

# List backups
./migration/scripts/restore.sh --list
```

### Restore Script
```bash
# Restore from backup
./migration/scripts/restore.sh examify-backup-20240420-143022.sql

# Clean restore (drops existing tables)
./migration/scripts/restore.sh --clean examify-backup-20240420-143022.sql
```

## 🔧 Manual Migration Steps

If you prefer to run steps manually:

### 1. Database Setup
```bash
# Connect to your Neon database
psql "$DATABASE_URL"

# Run schema creation
\i migration/sql/01-create-schema.sql

# Run data seeding
\i migration/sql/02-seed-data.sql

# Verify
\dt
SELECT COUNT(*) FROM questions;
```

### 2. Application Updates
```bash
# Install new dependencies
npm install pg @types/pg next-auth bcryptjs @types/bcryptjs

# Remove old dependencies
npm uninstall @supabase/supabase-js

# Create new files (see 04-application-updates.md)
# - lib/db.ts
# - lib/database-service.ts
# - pages/api/auth/[...nextauth].ts

# Update existing files
# - src/components/AuthForm.tsx
# - All dashboard components
```

## 🔍 Troubleshooting

### Common Issues

#### Connection Issues
```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Check SSL settings
psql "$DATABASE_URL?sslmode=require" -c "SELECT 1;"
```

#### Permission Issues
```bash
# Check user permissions
psql "$DATABASE_URL" -c "SELECT current_user, session_user;"

# Grant permissions if needed
psql "$DATABASE_URL" -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;"
```

#### Migration Failures
```bash
# Check migration logs
cat migration/migration.log

# Check database logs
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity;"
```

### Getting Help

1. **Check Logs**: Always check `migration/migration.log` first
2. **Verify Connection**: Ensure your `DATABASE_URL` is correct
3. **Check Permissions**: Ensure your database user has proper permissions
4. **Review Documentation**: Check Neon documentation for specific issues

## 📊 Migration Checklist

### Pre-Migration
- [ ] Neon account created
- [ ] Database project set up
- [ ] Connection string obtained
- [ ] Environment variables configured
- [ ] Application backup created

### Migration
- [ ] Schema migration completed
- [ ] Data migration completed
- [ ] Dependencies updated
- [ ] Code updated
- [ ] Authentication implemented

### Post-Migration
- [ ] Database connection tested
- [ ] Authentication flow tested
- [ ] All features tested
- [ ] Performance verified
- [ ] Backup strategy implemented

### Deployment
- [ ] Production environment configured
- [ ] Environment variables set
- [ ] Application deployed
- [ ] Monitoring set up
- [ ] Documentation updated

## 💰 Cost Analysis

### Current Costs
- **Supabase**: Frozen (unusable)
- **Migration**: Free (one-time effort)

### New Costs
- **Neon Free Tier**: $0/month
  - 3GB storage
  - 1 compute unit
  - Unlimited databases
  - Point-in-time recovery (7 days)

### Scaling Costs
- **Storage**: $0.16/GB/month (after 3GB)
- **Compute**: $0.16/hour (additional compute)
- **Typical Usage**: Should stay within free tier

## 🔒 Security Considerations

### Database Security
- Use SSL connections (enabled by default)
- Rotate passwords regularly
- Use connection pooling
- Monitor access logs

### Application Security
- Implement proper authentication
- Use environment variables for secrets
- Validate all inputs
- Implement rate limiting

## 📈 Performance Optimization

### Database
- Use indexes (already created in schema)
- Implement connection pooling
- Monitor query performance
- Use prepared statements

### Application
- Cache frequently accessed data
- Implement pagination
- Optimize database queries
- Use compression for large responses

## 🔄 Backup Strategy

### Automated Backups
```bash
# Set up cron job for daily backups
0 2 * * * /path/to/migration/scripts/backup.sh
```

### Manual Backups
```bash
# Before major changes
./migration/scripts/backup.sh

# Before deployments
./migration/scripts/backup.sh
```

### Restore Testing
```bash
# Test restore monthly
./migration/scripts/restore.sh --list
./migration/scripts/restore.sh latest-backup.sql
```

## 📞 Support

### Resources
- **Neon Documentation**: https://neon.tech/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **NextAuth.js Documentation**: https://next-auth.js.org/

### Community
- **Neon Discord**: https://discord.gg/neon
- **PostgreSQL Community**: https://www.postgresql.org/community/
- **NextAuth.js GitHub**: https://github.com/nextauthjs/next-auth

---

**Migration completed successfully? 🎉**

Your Examify application is now running on a free, scalable PostgreSQL database with modern authentication. Enjoy unlimited usage without the constraints of frozen databases!