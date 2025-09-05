#!/bin/bash

# Script to create the ads table and indexes in the PostgreSQL database
# This script safely creates the table if it doesn't exist

set -e  # Exit on any error

# Configuration
CONTAINER_NAME="trampolin-db-dev"
DB_NAME="trampolin"
DB_USER="postgres"
SQL_FILE="SQL/create_ads_table.sql"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up ads table in PostgreSQL database...${NC}"

# Check if Docker container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: PostgreSQL container '$CONTAINER_NAME' is not running.${NC}"
    echo "Please start the database with: docker-compose up -d"
    exit 1
fi

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: SQL file '$SQL_FILE' not found.${NC}"
    exit 1
fi

# Execute the SQL script
echo "Executing SQL script to create ads table and indexes..."
if docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$SQL_FILE"; then
    echo -e "${GREEN}✓ Ads table and indexes created successfully!${NC}"
    
    # Verify table creation
    echo "Verifying table structure..."
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "\d ads"
    
    echo -e "${GREEN}✓ Setup completed successfully!${NC}"
    echo "You can now import data using: docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < SQL/ads_202509041455.sql"
    echo ""
    echo "After import, use these commands to verify your data:"
    echo ""
    echo "1. Basic record count:"
    echo "   docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \"SELECT COUNT(*) as total_records FROM ads;\""
    echo ""
    echo "2. Detailed statistics:"
    echo "   docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \""
    echo "   SELECT "
    echo "       COUNT(*) as total_records,"
    echo "       COUNT(DISTINCT page_name) as unique_pages,"
    echo "       MIN(created_at) as earliest_record,"
    echo "       MAX(created_at) as latest_record"
    echo "   FROM ads;\""
    echo ""
    echo "3. Check recent imports by scraper and date:"
    echo "   docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c \""
    echo "   SELECT "
    echo "       scraper_name,"
    echo "       COUNT(*) as records,"
    echo "       DATE(created_at) as import_date"
    echo "   FROM ads "
    echo "   GROUP BY scraper_name, DATE(created_at) "
    echo "   ORDER BY import_date DESC;\""
else
    echo -e "${RED}✗ Failed to create ads table.${NC}"
    exit 1
fi
