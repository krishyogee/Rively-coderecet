#!/bin/bash
set -e

# Define variables for database connection
DB_USER="admin"
DB_PASSWORD="password"
DB_NAME="rively"
DB_HOST="localhost"
DB_PORT="5432"

# Path to the migrations folder
MIGRATIONS_PATH="./migrations"

# Step 1: Apply migrations using migrations-go
echo "Applying migrations..."
migrate -path $MIGRATIONS_PATH -database "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable" up

# Step 2: Create a temporary file for processing
TEMP_SCHEMA="./temp_schema.sql"
> "$TEMP_SCHEMA"

# Step 3: Dump and process the schema
echo "Dumping and processing schema..."
pg_dump --schema-only --no-owner --no-privileges -d "$DB_NAME" | while IFS= read -r line; do
    # Skip comments and certain commands
    if [[ $line =~ ^-- || $line =~ ^SET || $line =~ ^SELECT || $line =~ ^COMMENT || $line =~ ^\\. ]]; then
        continue
    fi
    
    # Process CREATE TABLE statements
    if [[ $line =~ ^CREATE\ TABLE ]]; then
        # Start collecting constraints for this table
        table_name=$(echo "$line" | awk '{print $3}' | tr -d '();')
        echo "$line" >> "$TEMP_SCHEMA"
        
        # Read the table definition
        while IFS= read -r table_line; do
            if [[ $table_line == ")" ]]; then
                # Before closing parenthesis, add any constraints for this table
                while IFS= read -r constraint_line; do
                    if [[ $constraint_line =~ ADD\ CONSTRAINT.*REFERENCES.*$table_name || \
                          $constraint_line =~ ADD\ CONSTRAINT.*$table_name ]]; then
                        constraint_content=${constraint_line#*ADD CONSTRAINT}
                        echo "    CONSTRAINT$constraint_content," >> "$TEMP_SCHEMA"
                    fi
                done < <(grep "ADD CONSTRAINT" schema.sql)
                # Close the table definition
                echo ");" >> "$TEMP_SCHEMA"
                break
            else
                echo "$table_line" >> "$TEMP_SCHEMA"
            fi
        done
    # Keep other non-constraint statements (like CREATE SEQUENCE)
    elif [[ ! $line =~ ^ADD\ CONSTRAINT ]]; then
        echo "$line" >> "$TEMP_SCHEMA"
    fi
done

# Step 4: Move the processed schema to final location
mv "$TEMP_SCHEMA" "./schema.sql"

echo "Schema processed and updated successfully!"