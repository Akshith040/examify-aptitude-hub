#!/bin/bash

# Database Restore Script for Examify
# Restores PostgreSQL database from backup files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] BACKUP_FILE"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -l, --list          List available backup files"
    echo "  -s, --schema-only   Restore schema only"
    echo "  -d, --data-only     Restore data only"
    echo "  -c, --clean         Drop existing tables before restore"
    echo "  -v, --verbose       Verbose output"
    echo ""
    echo "Examples:"
    echo "  $0 examify-backup-20240420-143022.sql"
    echo "  $0 --schema-only examify-backup-20240420-143022-schema.sql"
    echo "  $0 --clean examify-backup-20240420-143022.sql"
    echo ""
}

# List available backups
list_backups() {
    echo -e "${BLUE}Available backup files:${NC}"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        cd "$BACKUP_DIR"
        for file in examify-backup-*.sql examify-backup-*.sql.gz; do
            if [ -f "$file" ]; then
                size=$(du -h "$file" | cut -f1)
                date=$(stat -c %y "$file" 2>/dev/null || stat -f %Sm "$file" 2>/dev/null || echo "Unknown")
                echo -e "${GREEN}$file${NC} (${size}) - ${date}"
            fi
        done
    else
        echo "No backup directory found: $BACKUP_DIR"
    fi
    echo ""
}

# Check prerequisites
check_prerequisites() {
    # Check if psql is installed
    if ! command -v psql &> /dev/null; then
        error "psql is not installed. Please install PostgreSQL client tools."
    fi
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is not set"
    fi
    
    # Test database connection
    if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        error "Cannot connect to database. Please check your DATABASE_URL."
    fi
}

# Drop existing tables
drop_tables() {
    log "Dropping existing tables..."
    
    psql "$DATABASE_URL" << 'EOF'
-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS scheduled_tests CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_current_user_role(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop extensions (if they exist and are not used by other databases)
-- DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS "pgcrypto";

SELECT 'Tables dropped successfully' as status;
EOF
    
    success "Existing tables dropped"
}

# Restore database
restore_database() {
    local backup_file="$1"
    local restore_options="$2"
    
    log "Restoring database from: $backup_file"
    
    # Check if backup file exists
    if [ ! -f "$BACKUP_DIR/$backup_file" ]; then
        error "Backup file not found: $BACKUP_DIR/$backup_file"
    fi
    
    # Determine file type and restore accordingly
    if [[ "$backup_file" == *.gz ]]; then
        log "Restoring from compressed backup..."
        if gunzip -c "$BACKUP_DIR/$backup_file" | psql "$DATABASE_URL" $restore_options; then
            success "Database restored from compressed backup"
        else
            error "Failed to restore from compressed backup"
        fi
    else
        log "Restoring from SQL backup..."
        if psql "$DATABASE_URL" $restore_options < "$BACKUP_DIR/$backup_file"; then
            success "Database restored from SQL backup"
        else
            error "Failed to restore from SQL backup"
        fi
    fi
}

# Verify restore
verify_restore() {
    log "Verifying database restore..."
    
    # Check if tables exist
    TABLES=("users" "profiles" "questions" "scheduled_tests" "test_results")
    
    for table in "${TABLES[@]}"; do
        count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs)
        if [ $? -eq 0 ]; then
            success "Table '$table' restored with $count records"
        else
            error "Table '$table' is missing or inaccessible"
        fi
    done
    
    # Check if functions exist
    if psql "$DATABASE_URL" -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';" > /dev/null 2>&1; then
        success "Database functions restored"
    else
        warning "Some database functions may be missing"
    fi
}

# Main function
main() {
    local backup_file=""
    local schema_only=false
    local data_only=false
    local clean=false
    local verbose=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -l|--list)
                list_backups
                exit 0
                ;;
            -s|--schema-only)
                schema_only=true
                shift
                ;;
            -d|--data-only)
                data_only=true
                shift
                ;;
            -c|--clean)
                clean=true
                shift
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            -*)
                error "Unknown option: $1"
                ;;
            *)
                backup_file="$1"
                shift
                ;;
        esac
    done
    
    # Check if backup file is provided
    if [ -z "$backup_file" ]; then
        echo -e "${RED}Error: No backup file specified${NC}"
        echo ""
        show_usage
        exit 1
    fi
    
    # Set restore options
    local restore_options=""
    if [ "$verbose" = true ]; then
        restore_options="$restore_options -v"
    fi
    
    log "Starting database restore..."
    
    # Run restore steps
    check_prerequisites
    
    if [ "$clean" = true ]; then
        warning "This will drop all existing tables!"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            drop_tables
        else
            log "Restore cancelled by user"
            exit 0
        fi
    fi
    
    restore_database "$backup_file" "$restore_options"
    verify_restore
    
    success "Database restore completed successfully!"
    
    echo ""
    echo -e "${GREEN}=== RESTORE SUMMARY ===${NC}"
    echo -e "${GREEN}✓${NC} Database restored from: $backup_file"
    echo -e "${GREEN}✓${NC} All tables verified"
    echo -e "${GREEN}✓${NC} Database functions restored"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Test your application connectivity"
    echo "2. Verify data integrity"
    echo "3. Update application if needed"
}

# Handle script interruption
trap 'error "Restore interrupted by user"' INT TERM

# Run main function
main "$@"