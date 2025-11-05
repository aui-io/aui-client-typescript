#!/bin/bash

# Fetch OpenAPI from Production
# Usage: ./fetch-openapi.sh

set -e

OPENAPI_URL="https://azure.aui.io/api/ia-controller/api/openapi.json"
OUTPUT_FILE="../specs/openapi.json"

echo "📥 Fetching OpenAPI spec from production..."
echo "URL: $OPENAPI_URL"

# Fetch with retry logic
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s -o "${OUTPUT_FILE}.tmp" "$OPENAPI_URL"; then
        # Validate JSON
        if jq empty "${OUTPUT_FILE}.tmp" 2>/dev/null; then
            mv "${OUTPUT_FILE}.tmp" "$OUTPUT_FILE"
            echo "✅ Successfully fetched OpenAPI spec"
            
            # Print stats
            ENDPOINTS=$(jq '.paths | length' "$OUTPUT_FILE")
            VERSION=$(jq -r '.info.version' "$OUTPUT_FILE")
            echo "📊 Version: $VERSION"
            echo "📊 Total endpoints: $ENDPOINTS"
            exit 0
        else
            echo "❌ Invalid JSON received"
        fi
    else
        echo "❌ Failed to fetch (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        echo "⏳ Retrying in 5 seconds..."
        sleep 5
    fi
done

echo "❌ Failed to fetch OpenAPI spec after $MAX_RETRIES attempts"
exit 1

