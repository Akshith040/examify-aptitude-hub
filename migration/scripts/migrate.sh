#!/bin/bash

# Examify Database Migration Script
# This script automates the complete migration from Supabase to Neon PostgreSQL

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./migration/backups"
SCRIPTS_DIR="./migration/sql"
LOG_FILE="./migration/migration.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if psql is installed
    if ! command -v psql &> /dev/null; then
        error "psql is not installed. Please install PostgreSQL client tools."
    fi
    
    # Check if node is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js."
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm."
    fi
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is not set. Please configure your Neon database connection."
    fi
    
    success "All prerequisites met"
}

# Create backup directory
setup_directories() {
    log "Setting up directories..."
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    success "Directories created"
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
        success "Database connection successful"
    else
        error "Failed to connect to database. Please check your DATABASE_URL."
    fi
}

# Run schema migration
run_schema_migration() {
    log "Running schema migration..."
    
    if [ ! -f "$SCRIPTS_DIR/01-create-schema.sql" ]; then
        error "Schema migration file not found: $SCRIPTS_DIR/01-create-schema.sql"
    fi
    
    if psql "$DATABASE_URL" -f "$SCRIPTS_DIR/01-create-schema.sql" > "$BACKUP_DIR/schema-migration.log" 2>&1; then
        success "Schema migration completed"
    else
        error "Schema migration failed. Check $BACKUP_DIR/schema-migration.log for details."
    fi
}

# Run data seeding
run_data_seeding() {
    log "Running data seeding..."
    
    if [ ! -f "$SCRIPTS_DIR/02-seed-data.sql" ]; then
        warning "Seed data file not found: $SCRIPTS_DIR/02-seed-data.sql. Skipping data seeding."
        return
    fi
    
    if psql "$DATABASE_URL" -f "$SCRIPTS_DIR/02-seed-data.sql" > "$BACKUP_DIR/data-seeding.log" 2>&1; then
        success "Data seeding completed"
    else
        error "Data seeding failed. Check $BACKUP_DIR/data-seeding.log for details."
    fi
}

# Verify migration
verify_migration() {
    log "Verifying migration..."
    
    # Check if all tables exist
    TABLES=("users" "user_sessions" "profiles" "questions" "scheduled_tests" "test_results")
    
    for table in "${TABLES[@]}"; do
        if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM $table;" > /dev/null 2>&1; then
            success "Table '$table' exists and is accessible"
        else
            error "Table '$table' is missing or inaccessible"
        fi
    done
    
    # Check if functions exist
    if psql "$DATABASE_URL" -c "SELECT get_current_user_role('00000000-0000-0000-0000-000000000001');" > /dev/null 2>&1; then
        success "Custom functions are working"
    else
        warning "Custom functions may not be working properly"
    fi
}

# Install Node.js dependencies
install_dependencies() {
    log "Installing Node.js dependencies..."
    
    # Install new dependencies
    if npm install pg @types/pg next-auth bcryptjs @types/bcryptjs; then
        success "New dependencies installed"
    else
        error "Failed to install new dependencies"
    fi
    
    # Remove Supabase dependency
    if npm uninstall @supabase/supabase-js; then
        success "Supabase dependency removed"
    else
        warning "Failed to remove Supabase dependency (may not be installed)"
    fi
}

# Create backup of current application
backup_application() {
    log "Creating application backup..."
    
    BACKUP_NAME="app-backup-$(date +'%Y%m%d-%H%M%S')"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    # Create backup directory
    mkdir -p "$BACKUP_PATH"
    
    # Copy important files
    cp -r src "$BACKUP_PATH/" 2>/dev/null || true
    cp package.json "$BACKUP_PATH/" 2>/dev/null || true
    cp package-lock.json "$BACKUP_PATH/" 2>/dev/null || true
    cp .env.local "$BACKUP_PATH/.env.local.backup" 2>/dev/null || true
    cp .env "$BACKUP_PATH/.env.backup" 2>/dev/null || true
    
    success "Application backup created at $BACKUP_PATH"
}

# Generate environment file template
generate_env_template() {
    log "Generating environment file template..."
    
    cat > .env.local.template << EOF
# Neon PostgreSQL Database
DATABASE_URL="your-neon-connection-string-here"
DIRECT_URL="your-neon-connection-string-here"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32 2>/dev/null || echo 'generate-a-secure-secret-key-here')"

# Application Settings
NODE_ENV="development"
EOF
    
    success "Environment template created: .env.local.template"
}

# Main migration function
main() {
    log "Starting Examify database migration..."
    log "Migration log: $LOG_FILE"
    
    # Run migration steps
    setup_directories
    check_prerequisites
    backup_application
    test_connection
    run_schema_migration
    run_data_seeding
    verify_migration
    install_dependencies
    generate_env_template
    
    success "Migration completed successfully!"
    
    echo ""
    echo -e "${GREEN}=== MIGRATION SUMMARY ===${NC}"
    echo -e "${GREEN}✓${NC} Database schema created"
    echo -e "${GREEN}✓${NC} Sample data inserted"
    echo -e "${GREEN}✓${NC} Dependencies updated"
    echo -e "${GREEN}✓${NC} Application backup created"
    echo ""
    echo -e "${YELLOW}NEXT STEPS:${NC}"
    echo "1. Update your .env.local file with the correct DATABASE_URL"
    echo "2. Update your application code to use the new database service"
    echo "3. Test the authentication flow"
    echo "4. Deploy your application"
    echo ""
    echo -e "${BLUE}For detailed instructions, see:${NC}"
    echo "- migration/03-neon-setup.md"
    echo "- migration/04-application-updates.md"
    echo ""
    echo -e "${GREEN}Migration log saved to: $LOG_FILE${NC}"
}

# Handle script interruption
trap 'error "Migration interrupted by user"' INT TERM

# Run main function
main "$@"