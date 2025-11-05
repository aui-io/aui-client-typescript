# Apollo SDK - Automated Generation & Publishing

> **One-command solution** to generate and publish TypeScript and Python SDKs from FastAPI OpenAPI specifications.

---

## 🚀 Quick Start

### One Command to Rule Them All

```bash
cd apollo-sdk
export NPM_TOKEN='your-npm-token'
export PYPI_TOKEN='your-pypi-token'
./generate-and-publish.sh
```

**That's it!** This will:
1. ✅ Fetch OpenAPI from production (Azure)
2. ✅ Filter external-only endpoints
3. ✅ Validate specifications
4. ✅ Generate TypeScript SDK
5. ✅ Generate Python SDK
6. ✅ Publish to npm (@aui/apollo-sdk)
7. ✅ Publish to PyPI (aui-apollo-api)

---

## 📋 Prerequisites

### Required Tools

```bash
# Node.js & npm
node --version  # v18+ recommended
npm --version

# jq (JSON processor)
brew install jq  # macOS
apt-get install jq  # Linux

# Fern CLI
npm install -g fern-api

# curl (usually pre-installed)
curl --version
```

### Required Environment Variables

For **publishing** to npm and PyPI:

```bash
export NPM_TOKEN='npm_...'           # npm publish token
export PYPI_TOKEN='pypi-...'         # PyPI publish token
```

**How to get tokens:**
- **npm:** https://www.npmjs.com/ → Account Settings → Access Tokens
- **PyPI:** https://pypi.org/ → Account Settings → API tokens

---

## 🎯 Usage Options

### 1. Full Automation (Production)

Generate and publish to npm + PyPI:

```bash
./generate-and-publish.sh
```

### 2. Local Testing Only

Generate SDKs locally without publishing:

```bash
./generate-and-publish.sh --local-only
```

Output will be in:
- `generated-sdks/typescript/`
- `generated-sdks/python/`

### 3. Dry Run

Validate without making changes:

```bash
./generate-and-publish.sh --dry-run
```

### 4. Skip Publishing

Generate SDKs but don't publish:

```bash
./generate-and-publish.sh --skip-publish
```

### 5. Help

```bash
./generate-and-publish.sh --help
```

---

## 📂 Directory Structure

```
apollo-sdk/
├── generate-and-publish.sh      # 🎯 MAIN SCRIPT - Run this!
├── README.md                     # This file
├── specs/                        # API specifications
│   ├── openapi.json              # Full OpenAPI (fetched)
│   ├── external-openapi.json     # Filtered external-only
│   └── asyncapi.yaml             # WebSocket API spec
├── scripts/                      # Automation scripts
│   ├── fetch-openapi.sh          # Fetch from production
│   └── filter-external-api.js    # Filter external endpoints
├── fern/                         # Fern configuration
│   ├── fern.config.json
│   ├── generators.yml            # SDK generation config
│   └── definition/
│       ├── api.yml
│       └── __package__.yml
├── generated-sdks/               # Local SDK outputs (--local-only)
│   ├── typescript/
│   └── python/
└── tests/                        # Integration tests
    ├── typescript/
    └── python/
```

---

## 🔧 For DevOps: Jenkins Integration

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    
    environment {
        NPM_TOKEN = credentials('npm-publish-token')
        PYPI_TOKEN = credentials('pypi-publish-token')
    }
    
    triggers {
        // Run daily at 2 AM
        cron('0 2 * * *')
    }
    
    stages {
        stage('Generate and Publish SDKs') {
            steps {
                dir('apollo-sdk') {
                    sh '''
                        export NPM_TOKEN="${NPM_TOKEN}"
                        export PYPI_TOKEN="${PYPI_TOKEN}"
                        ./generate-and-publish.sh
                    '''
                }
            }
        }
    }
    
    post {
        success {
            slackSend(
                channel: '#sdk-updates',
                color: 'good',
                message: "✅ Apollo SDKs published successfully"
            )
        }
        failure {
            slackSend(
                channel: '#sdk-updates',
                color: 'danger',
                message: "❌ Apollo SDK generation failed: ${env.BUILD_URL}"
            )
        }
    }
}
```

### Required Jenkins Credentials

Add these in Jenkins Credentials:
- `npm-publish-token` (Secret text) - npm publish token
- `pypi-publish-token` (Secret text) - PyPI publish token

### Bitbucket Pipelines Alternative

```yaml
pipelines:
  custom:
    generate-sdks:
      - step:
          name: Generate and Publish Apollo SDKs
          image: node:18
          script:
            - apt-get update && apt-get install -y jq curl
            - npm install -g fern-api
            - cd apollo-sdk
            - export NPM_TOKEN=$NPM_TOKEN
            - export PYPI_TOKEN=$PYPI_TOKEN
            - ./generate-and-publish.sh
          after-script:
            - echo "SDK generation completed"
  
  schedules:
    daily-sdk-generation:
      - cron: "0 2 * * *"  # Daily at 2 AM
        step:
          name: Scheduled SDK Generation
          script:
            - cd apollo-sdk
            - ./generate-and-publish.sh
```

---

## 🧪 Testing Locally

### 1. Generate SDKs Locally

```bash
./generate-and-publish.sh --local-only
```

### 2. Test TypeScript SDK

```bash
cd generated-sdks/typescript
npm install
npm run build

# Test in a sample project
cd ../../tests/typescript
npm install ../../generated-sdks/typescript
npm test
```

### 3. Test Python SDK

```bash
cd generated-sdks/python
pip install -e .

# Test in a sample project
cd ../../tests/python
pip install -e ../../generated-sdks/python
pytest
```

---

## 🔍 Troubleshooting

### Error: "Missing required environment variables"

**Solution:** Set npm and PyPI tokens:
```bash
export NPM_TOKEN='your-npm-token'
export PYPI_TOKEN='your-pypi-token'
```

Or run with `--local-only` to skip publishing.

### Error: "fern: command not found"

**Solution:** Install Fern CLI:
```bash
npm install -g fern-api
```

### Error: "jq: command not found"

**Solution:** Install jq:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```

### Error: "Failed to fetch OpenAPI spec"

**Solution:** Check:
1. Network connectivity to Azure production
2. API endpoint is accessible: `https://azure.aui.io/api/ia-controller/api/openapi.json`
3. No firewall blocking requests

### Error: "Fern configuration is invalid"

**Solution:**
```bash
cd fern
fern check
# Review error messages and fix configuration
```

### SDKs published but not working

**Solution:** Check versioning:
```bash
# npm
npm view @aui/apollo-sdk versions

# PyPI
pip index versions aui-apollo-api
```

---

## 📊 What Gets Published

### TypeScript SDK

**Package:** `@aui/apollo-sdk`  
**Registry:** npm (https://www.npmjs.com/package/@aui/apollo-sdk)

**Installation:**
```bash
npm install @aui/apollo-sdk
```

**Usage:**
```typescript
import { AuiApolloApiClient } from '@aui/apollo-sdk';

const client = new AuiApolloApiClient({
  environment: 'https://azure.aui.io',
  apiKey: 'your-api-key',
});

const tasks = await client.getTasksByUserIdApiV1ExternalTasksGet({
  user_id: 'user-123',
});
```

### Python SDK

**Package:** `aui-apollo-api`  
**Registry:** PyPI (https://pypi.org/project/aui-apollo-api/)

**Installation:**
```bash
pip install aui-apollo-api
```

**Usage:**
```python
from aui_apollo_api import AuiApolloApiClient

client = AuiApolloApiClient(
    base_url='https://azure.aui.io',
    api_key='your-api-key'
)

tasks = client.get_tasks_by_user_id_api_v1_external_tasks_get(
    user_id='user-123'
)
```

---

## 🔄 Manual Steps (If Needed)

If you need to run individual steps:

### Step 1: Fetch OpenAPI

```bash
cd scripts
./fetch-openapi.sh
```

### Step 2: Filter External Endpoints

```bash
node filter-external-api.js
```

### Step 3: Generate SDKs

```bash
cd ../fern
fern generate --group local-testing  # Local only
# or
fern generate --group production-sdks  # Publish to npm + PyPI
```

---

## 🆘 Support

**Issues?** Contact:
- **Platform Team:** #platform-team on Slack
- **DevOps:** #devops on Slack
- **Documentation:** [Design Document](../apollo-sdk-poc/SDK_AUTOMATION_DESIGN.md)

---

## 📝 Version History

- **v1.0.0** - Initial automated setup
  - One-command generation and publishing
  - TypeScript and Python SDKs
  - Production-ready automation

---

**Last Updated:** November 5, 2025  
**Maintained By:** Platform Team

