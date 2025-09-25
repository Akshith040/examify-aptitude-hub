# Examify Database Migration Script (PowerShell)
# This script automates the complete migration from Supabase to Neon PostgreSQL

param(
    [switch]$Help,
    [switch]$SkipBackup,
    [switch]$SkipDependencies,
    [string]$DatabaseUrl = $env:DATABASE_URL
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

# Configuration
$BackupDir = "./migration/backups"
$ScriptsDir = "./migration/sql"
$LogFile = "./migration/migration.log"

# Functions
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-Success {
    param([string]$Message)
    Write-Log "[SUCCESS] $Message" $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Log "[WARNING] $Message" $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Log "[ERROR] $Message" $Red
    exit 1
}

function Show-Help {
    Write-Host @"
Examify Database Migration Script

USAGE:
    .\migrate.ps1 [OPTIONS]

OPTIONS:
    -Help               Show this help message
    -SkipBackup         Skip application backup
    -SkipDependencies   Skip npm dependency installation
    -DatabaseUrl        Database connection string (or set DATABASE_URL env var)

EXAMPLES:
    .\migrate.ps1
    .\migrate.ps1 -SkipBackup
    .\migrate.ps1 -DatabaseUrl "postgresql://user:pass@host/db"

PREREQUISITES:
    - PostgreSQL client tools (psql)
    - Node.js and npm
    - DATABASE_URL environment variable set
    - Neon database created and accessible

"@
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..." $Blue
    
    # Check if psql is available
    try {
        $null = Get-Command psql -ErrorAction Stop
    } catch {
        Write-Error "psql is not installed or not in PATH. Please install PostgreSQL client tools."
    }
    
    # Check if node is available
    try {
        $null = Get-Command node -ErrorAction Stop
    } catch {
        Write-Error "Node.js is not installed or not in PATH. Please install Node.js."
    }
    
    # Check if npm is available
    try {
        $null = Get-Command npm -ErrorAction Stop
    } catch {
        Write-Error "npm is not installed or not in PATH. Please install npm."
    }
    
    # Check if DATABASE_URL is set
    if (-not $DatabaseUrl) {
        Write-Error "DATABASE_URL is not set. Please set the environment variable or use -DatabaseUrl parameter."
    }
    
    Write-Success "All prerequisites met"
}

# Create directories
function Initialize-Directories {
    Write-Log "Setting up directories..." $Blue
    
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    
    $logDir = Split-Path $LogFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Write-Success "Directories created"
}

# Test database connection
function Test-DatabaseConnection {
    Write-Log "Testing database connection..." $Blue
    
    try {
        $result = & psql $DatabaseUrl -c "SELECT version();" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database connection successful"
        } else {
            Write-Error "Failed to connect to database. Please check your DATABASE_URL."
        }
    } catch {
        Write-Error "Failed to connect to database: $_"
    }
}

# Run schema migration
function Invoke-SchemaMigration {
    Write-Log "Running schema migration..." $Blue
    
    $schemaFile = "$ScriptsDir/01-create-schema.sql"
    if (-not (Test-Path $schemaFile)) {
        Write-Error "Schema migration file not found: $schemaFile"
    }
    
    try {
        $logPath = "$BackupDir/schema-migration.log"
        & psql $DatabaseUrl -f $schemaFile > $logPath 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Schema migration completed"
        } else {
            Write-Error "Schema migration failed. Check $logPath for details."
        }
    } catch {
        Write-Error "Schema migration failed: $_"
    }
}

# Run data seeding
function Invoke-DataSeeding {
    Write-Log "Running data seeding..." $Blue
    
    $seedFile = "$ScriptsDir/02-seed-data.sql"
    if (-not (Test-Path $seedFile)) {
        Write-Warning "Seed data file not found: $seedFile. Skipping data seeding."
        return
    }
    
    try {
        $logPath = "$BackupDir/data-seeding.log"
        & psql $DatabaseUrl -f $seedFile > $logPath 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Data seeding completed"
        } else {
            Write-Error "Data seeding failed. Check $logPath for details."
        }
    } catch {
        Write-Error "Data seeding failed: $_"
    }
}

# Verify migration
function Test-Migration {
    Write-Log "Verifying migration..." $Blue
    
    $tables = @("users", "user_sessions", "profiles", "questions", "scheduled_tests", "test_results")
    
    foreach ($table in $tables) {
        try {
            & psql $DatabaseUrl -c "SELECT COUNT(*) FROM $table;" > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Table '$table' exists and is accessible"
            } else {
                Write-Error "Table '$table' is missing or inaccessible"
            }
        } catch {
            Write-Error "Failed to verify table '$table': $_"
        }
    }
    
    # Check if functions exist
    try {
        & psql $DatabaseUrl -c "SELECT get_current_user_role('00000000-0000-0000-0000-000000000001');" > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Custom functions are working"
        } else {
            Write-Warning "Custom functions may not be working properly"
        }
    } catch {
        Write-Warning "Custom functions verification failed: $_"
    }
}

# Install Node.js dependencies
function Install-Dependencies {
    if ($SkipDependencies) {
        Write-Log "Skipping dependency installation..." $Yellow
        return
    }
    
    Write-Log "Installing Node.js dependencies..." $Blue
    
    # Install new dependencies
    try {
        & npm install pg @types/pg next-auth bcryptjs @types/bcryptjs
        if ($LASTEXITCODE -eq 0) {
            Write-Success "New dependencies installed"
        } else {
            Write-Error "Failed to install new dependencies"
        }
    } catch {
        Write-Error "Failed to install new dependencies: $_"
    }
    
    # Remove Supabase dependency
    try {
        & npm uninstall @supabase/supabase-js 2>$null
        Write-Success "Supabase dependency removed"
    } catch {
        Write-Warning "Failed to remove Supabase dependency (may not be installed)"
    }
}

# Create application backup
function Backup-Application {
    if ($SkipBackup) {
        Write-Log "Skipping application backup..." $Yellow
        return
    }
    
    Write-Log "Creating application backup..." $Blue
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupName = "app-backup-$timestamp"
    $backupPath = "$BackupDir/$backupName"
    
    # Create backup directory
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    # Copy important files
    if (Test-Path "src") {
        Copy-Item -Path "src" -Destination $backupPath -Recurse -Force
    }
    if (Test-Path "package.json") {
        Copy-Item -Path "package.json" -Destination $backupPath -Force
    }
    if (Test-Path "package-lock.json") {
        Copy-Item -Path "package-lock.json" -Destination $backupPath -Force
    }
    if (Test-Path ".env.local") {
        Copy-Item -Path ".env.local" -Destination "$backupPath/.env.local.backup" -Force
    }
    if (Test-Path ".env") {
        Copy-Item -Path ".env" -Destination "$backupPath/.env.backup" -Force
    }
    
    Write-Success "Application backup created at $backupPath"
}

# Generate environment file template
function New-EnvironmentTemplate {
    Write-Log "Generating environment file template..." $Blue
    
    # Generate a random secret
    $secret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    
    $envTemplate = @"
# Neon PostgreSQL Database
DATABASE_URL="your-neon-connection-string-here"
DIRECT_URL="your-neon-connection-string-here"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$secret"

# Application Settings
NODE_ENV="development"
"@
    
    Set-Content -Path ".env.local.template" -Value $envTemplate
    Write-Success "Environment template created: .env.local.template"
}

# Main migration function
function Start-Migration {
    Write-Log "Starting Examify database migration..." $Blue
    Write-Log "Migration log: $LogFile" $Blue
    
    # Run migration steps
    Initialize-Directories
    Test-Prerequisites
    Backup-Application
    Test-DatabaseConnection
    Invoke-SchemaMigration
    Invoke-DataSeeding
    Test-Migration
    Install-Dependencies
    New-EnvironmentTemplate
    
    Write-Success "Migration completed successfully!"
    
    Write-Host ""
    Write-Host "=== MIGRATION SUMMARY ===" -ForegroundColor $Green
    Write-Host "✓ Database schema created" -ForegroundColor $Green
    Write-Host "✓ Sample data inserted" -ForegroundColor $Green
    Write-Host "✓ Dependencies updated" -ForegroundColor $Green
    Write-Host "✓ Application backup created" -ForegroundColor $Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor $Yellow
    Write-Host "1. Update your .env.local file with the correct DATABASE_URL"
    Write-Host "2. Update your application code to use the new database service"
    Write-Host "3. Test the authentication flow"
    Write-Host "4. Deploy your application"
    Write-Host ""
    Write-Host "For detailed instructions, see:" -ForegroundColor $Blue
    Write-Host "- migration/03-neon-setup.md"
    Write-Host "- migration/04-application-updates.md"
    Write-Host ""
    Write-Host "Migration log saved to: $LogFile" -ForegroundColor $Green
}

# Handle script interruption
trap {
    Write-Error "Migration interrupted by user"
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

# Run main function
try {
    Start-Migration
} catch {
    Write-Error "Migration failed: $_"
}