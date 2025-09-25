#!/bin/bash

# Database Backup Script for Examify
# Creates backups of the PostgreSQL database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +'%Y%m%d-%H%M%S')
BACKUP_NAME="examify-backup-$DATE"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL environment variable is not set"
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting database backup..."

# Create full database backup
log "Creating full database backup..."
if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_NAME.sql"; then
    success "Full backup created: $BACKUP_DIR/$BACKUP_NAME.sql"
else
    error "Failed to create full backup"
fi

# Create schema-only backup
log "Creating schema-only backup..."
if pg_dump --schema-only "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_NAME-schema.sql"; then
    success "Schema backup created: $BACKUP_DIR/$BACKUP_NAME-schema.sql"
else
    error "Failed to create schema backup"
fi

# Create data-only backup
log "Creating data-only backup..."
if pg_dump --data-only "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_NAME-data.sql"; then
    success "Data backup created: $BACKUP_DIR/$BACKUP_NAME-data.sql"
else
    error "Failed to create data backup"
fi

# Create compressed backup
log "Creating compressed backup..."
if pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$BACKUP_NAME.sql.gz"; then
    success "Compressed backup created: $BACKUP_DIR/$BACKUP_NAME.sql.gz"
else
    error "Failed to create compressed backup"
fi

# Create backup info file
cat > "$BACKUP_DIR/$BACKUP_NAME-info.txt" << EOF
Examify Database Backup Information
===================================

Backup Date: $(date)
Database URL: ${DATABASE_URL%/*}/[database]
Backup Files:
- Full backup: $BACKUP_NAME.sql
- Schema only: $BACKUP_NAME-schema.sql
- Data only: $BACKUP_NAME-data.sql
- Compressed: $BACKUP_NAME.sql.gz

Restore Commands:
- Full restore: psql \$DATABASE_URL < $BACKUP_NAME.sql
- Schema only: psql \$DATABASE_URL < $BACKUP_NAME-schema.sql
- Data only: psql \$DATABASE_URL < $BACKUP_NAME-data.sql
- Compressed: gunzip -c $BACKUP_NAME.sql.gz | psql \$DATABASE_URL

Table Counts:
EOF

# Add table counts to info file
psql "$DATABASE_URL" -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows
FROM pg_stat_user_tables 
ORDER BY schemaname, tablename;
" >> "$BACKUP_DIR/$BACKUP_NAME-info.txt"

success "Backup info created: $BACKUP_DIR/$BACKUP_NAME-info.txt"

# Clean up old backups (keep last 10)
log "Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t examify-backup-*.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
ls -t examify-backup-*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
ls -t examify-backup-*-schema.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
ls -t examify-backup-*-data.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
ls -t examify-backup-*-info.txt 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

success "Backup completed successfully!"
echo ""
echo -e "${GREEN}=== BACKUP SUMMARY ===${NC}"
echo -e "${GREEN}✓${NC} Full backup: $BACKUP_DIR/$BACKUP_NAME.sql"
echo -e "${GREEN}✓${NC} Schema backup: $BACKUP_DIR/$BACKUP_NAME-schema.sql"
echo -e "${GREEN}✓${NC} Data backup: $BACKUP_DIR/$BACKUP_NAME-data.sql"
echo -e "${GREEN}✓${NC} Compressed backup: $BACKUP_DIR/$BACKUP_NAME.sql.gz"
echo -e "${GREEN}✓${NC} Backup info: $BACKUP_DIR/$BACKUP_NAME-info.txt"
echo ""
echo -e "${YELLOW}To restore from backup:${NC}"
echo "psql \$DATABASE_URL < $BACKUP_DIR/$BACKUP_NAME.sql"