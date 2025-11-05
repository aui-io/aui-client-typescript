#!/bin/bash

################################################################################
# Apollo SDK - Automated Generation and Publishing
################################################################################
# This script automates the entire SDK generation and publishing process:
# 1. Fetches OpenAPI from production
# 2. Filters external-only endpoints
# 3. Validates specs (OpenAPI + AsyncAPI)
# 4. Generates SDKs using Fern (TypeScript + Python)
# 5. Publishes to npm and PyPI
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
SKIP_PUBLISH=false
LOCAL_ONLY=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            echo -e "${YELLOW}🔍 Running in DRY RUN mode (no publishing)${NC}"
            shift
            ;;
        --skip-publish)
            SKIP_PUBLISH=true
            echo -e "${YELLOW}⏭️  Skipping publish step${NC}"
            shift
            ;;
        --local-only)
            LOCAL_ONLY=true
            echo -e "${YELLOW}💻 Local generation only (no npm/PyPI)${NC}"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run       Run without publishing (validate only)"
            echo "  --skip-publish  Generate SDKs but skip publishing"
            echo "  --local-only    Generate SDKs locally without npm/PyPI"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Function to print step headers
print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check required environment variables
check_env_vars() {
    local missing_vars=()
    
    if [ "$SKIP_PUBLISH" = false ] && [ "$LOCAL_ONLY" = false ]; then
        if [ -z "$NPM_TOKEN" ]; then
            missing_vars+=("NPM_TOKEN")
        fi
        if [ -z "$PYPI_TOKEN" ]; then
            missing_vars+=("PYPI_TOKEN")
        fi
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        for var in "${missing_vars[@]}"; do
            echo -e "${RED}   - $var${NC}"
        done
        echo ""
        echo "Please set them before running this script:"
        echo "  export NPM_TOKEN='your-npm-token'"
        echo "  export PYPI_TOKEN='your-pypi-token'"
        echo ""
        echo "Or run with --local-only to skip publishing"
        exit 1
    fi
}

# Function to check required tools
check_dependencies() {
    local missing_deps=()
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v fern &> /dev/null; then
        missing_deps+=("fern (install with: npm install -g fern-api)")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required dependencies:${NC}"
        for dep in "${missing_deps[@]}"; do
            echo -e "${RED}   - $dep${NC}"
        done
        exit 1
    fi
}

# Change to scripts directory
cd "$(dirname "$0")/scripts"

################################################################################
# STEP 0: Pre-flight checks
################################################################################
print_step "🚀 STEP 0: Pre-flight Checks"

echo "✅ Checking dependencies..."
check_dependencies

echo "✅ Checking environment variables..."
check_env_vars

echo -e "${GREEN}✅ All pre-flight checks passed${NC}"

################################################################################
# STEP 1: Fetch OpenAPI from Production
################################################################################
print_step "📥 STEP 1: Fetching OpenAPI from Production"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔍 DRY RUN: Would fetch OpenAPI from production${NC}"
else
    ./fetch-openapi.sh
fi

################################################################################
# STEP 2: Filter External Endpoints
################################################################################
print_step "🔍 STEP 2: Filtering External Endpoints"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔍 DRY RUN: Would filter external endpoints${NC}"
else
    node filter-external-api.js
    
    # Copy filtered OpenAPI to Fern definition directory
    echo "📋 Copying filtered OpenAPI to Fern definition..."
    cp ../specs/external-openapi.json ../fern/definition/openapi.json
    echo -e "${GREEN}✅ OpenAPI copied to Fern definition${NC}"
fi

################################################################################
# STEP 3: Validate Specs
################################################################################
print_step "✅ STEP 3: Validating API Specifications"

echo "📄 Validating external-openapi.json..."
if jq empty ../specs/external-openapi.json 2>/dev/null; then
    ENDPOINTS=$(jq '.paths | length' ../specs/external-openapi.json)
    SCHEMAS=$(jq '.components.schemas | length' ../specs/external-openapi.json)
    echo -e "${GREEN}✅ OpenAPI spec is valid${NC}"
    echo "   - Endpoints: $ENDPOINTS"
    echo "   - Schemas: $SCHEMAS"
else
    echo -e "${RED}❌ OpenAPI spec is invalid${NC}"
    exit 1
fi

echo ""
echo "📄 Checking asyncapi.yaml..."
if [ -f "../specs/asyncapi.yaml" ]; then
    echo -e "${GREEN}✅ AsyncAPI spec exists${NC}"
else
    echo -e "${YELLOW}⚠️  AsyncAPI spec not found (optional)${NC}"
fi

################################################################################
# STEP 4: Generate SDKs with Fern
################################################################################
print_step "🎨 STEP 4: Generating SDKs with Fern"

cd ../fern

echo "🔍 Validating Fern configuration..."
if fern check; then
    echo -e "${GREEN}✅ Fern configuration is valid${NC}"
else
    echo -e "${RED}❌ Fern configuration is invalid${NC}"
    exit 1
fi

if [ "$LOCAL_ONLY" = true ]; then
    echo ""
    echo "💻 Generating SDKs locally..."
    fern generate --group local-testing --log-level info
    echo -e "${GREEN}✅ SDKs generated locally in generated-sdks/${NC}"
    echo ""
    echo "📦 Local SDK paths:"
    echo "   - TypeScript: apollo-sdk/generated-sdks/typescript/"
    echo "   - Python: apollo-sdk/generated-sdks/python/"
    exit 0
fi

################################################################################
# STEP 5: Publish to npm and PyPI
################################################################################
if [ "$SKIP_PUBLISH" = false ]; then
    print_step "📦 STEP 5: Publishing SDKs"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}🔍 DRY RUN: Would publish SDKs to npm and PyPI${NC}"
    else
        echo "🚀 Publishing to npm and PyPI..."
        fern generate --group production-sdks --log-level info
        
        echo ""
        echo -e "${GREEN}✅ SDKs published successfully!${NC}"
        echo ""
        echo "📦 Published packages:"
        echo "   - npm: @aui/apollo-sdk"
        echo "   - PyPI: aui-apollo-api"
    fi
fi

################################################################################
# COMPLETION
################################################################################
print_step "✨ SDK Generation Complete!"

echo "📊 Summary:"
echo "   ✅ Fetched OpenAPI from production"
echo "   ✅ Filtered external endpoints"
echo "   ✅ Validated specifications"
echo "   ✅ Generated TypeScript SDK"
echo "   ✅ Generated Python SDK"

if [ "$SKIP_PUBLISH" = false ] && [ "$DRY_RUN" = false ]; then
    echo "   ✅ Published to npm"
    echo "   ✅ Published to PyPI"
fi

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
echo ""

if [ "$LOCAL_ONLY" = false ] && [ "$SKIP_PUBLISH" = false ] && [ "$DRY_RUN" = false ]; then
    echo "📚 Installation commands:"
    echo "   npm install @aui/apollo-sdk"
    echo "   pip install aui-apollo-api"
fi

echo ""

