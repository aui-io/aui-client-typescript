# How to Run - Apollo SDK Generation

**TL;DR:** One command does everything! 🚀

---

## 🎯 The One Command

```bash
cd /Users/aui/AUI/aui-common-services/apollo-sdk
export NPM_TOKEN='your-npm-token'
export PYPI_TOKEN='your-pypi-token'
./generate-and-publish.sh
```

**That's it!** ✨

---

## 📋 Prerequisites (One-time Setup)

### 1. Install Tools

```bash
# Check Node.js (need v18+)
node --version

# Install Fern CLI
npm install -g fern-api

# Install jq
brew install jq  # macOS
# or
sudo apt-get install jq  # Linux
```

### 2. Get Tokens

**npm Token:**
1. Go to https://www.npmjs.com/
2. Settings → Access Tokens
3. Generate New Token (Publish)
4. Copy token

**PyPI Token:**
1. Go to https://pypi.org/
2. Account Settings → API tokens
3. Add API token
4. Copy token

---

## 🚀 Usage Examples

### Example 1: Test Locally (No Publishing)

**Best for:** First-time testing, development

```bash
cd apollo-sdk
./generate-and-publish.sh --local-only
```

**Output:** SDKs generated in `generated-sdks/` folder

---

### Example 2: Dry Run (Validate Everything)

**Best for:** Testing before actual publish

```bash
cd apollo-sdk
export NPM_TOKEN='...'
export PYPI_TOKEN='...'
./generate-and-publish.sh --dry-run
```

**Output:** Runs everything except publishing

---

### Example 3: Full Run (Publish to npm & PyPI)

**Best for:** Production use

```bash
cd apollo-sdk
export NPM_TOKEN='...'
export PYPI_TOKEN='...'
./generate-and-publish.sh
```

**Output:** Published packages!
- npm: `@aui/apollo-sdk`
- PyPI: `aui-apollo-api`

---

## 🎬 Step-by-Step Walkthrough

### Step 1: Navigate to Directory

```bash
cd /Users/aui/AUI/aui-common-services/apollo-sdk
```

### Step 2: Set Environment Variables

```bash
# Option A: Set for this session
export NPM_TOKEN='npm_xxxxxxxxxxxxxxxxxxxxx'
export PYPI_TOKEN='pypi-xxxxxxxxxxxxxxxxxxxxx'

# Option B: Or skip publishing with --local-only
# (No tokens needed for local-only mode)
```

### Step 3: Run the Script

```bash
# Full run (with publishing)
./generate-and-publish.sh

# OR test locally first
./generate-and-publish.sh --local-only
```

### Step 4: Wait (~3-5 minutes)

You'll see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 STEP 0: Pre-flight Checks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All pre-flight checks passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 STEP 1: Fetching OpenAPI from Production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully fetched OpenAPI spec

[... more steps ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SDK Generation Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5: Verify (if published)

```bash
# Check npm
npm view @aui/apollo-sdk

# Check PyPI
pip index versions aui-apollo-api
```

---

## 🔍 What Each Flag Does

| Flag | What It Does | When to Use |
|------|--------------|-------------|
| (none) | Full run with publishing | Production use |
| `--local-only` | Generate locally, don't publish | Testing, development |
| `--dry-run` | Validate everything, don't publish | Pre-flight check |
| `--skip-publish` | Generate but don't publish | Testing Fern generation |
| `--help` | Show help message | Learning about options |

---

## ✅ Expected Behavior

### What Happens:
1. ✅ Fetches latest OpenAPI from production (Azure)
2. ✅ Filters to external endpoints only
3. ✅ Validates both OpenAPI and AsyncAPI specs
4. ✅ Generates TypeScript SDK
5. ✅ Generates Python SDK
6. ✅ Publishes to npm and PyPI (unless --local-only or --skip-publish)

### Duration:
- **Local only:** ~2-3 minutes
- **With publishing:** ~3-5 minutes

### Output:
- **Console:** Colored progress messages
- **Files:** Generated SDKs (if --local-only)
- **Packages:** Published to npm & PyPI (if full run)

---

## 🆘 Troubleshooting

### Error: "Missing required environment variables"

**Fix:**
```bash
export NPM_TOKEN='your-token'
export PYPI_TOKEN='your-token'

# Or run without publishing:
./generate-and-publish.sh --local-only
```

### Error: "fern: command not found"

**Fix:**
```bash
npm install -g fern-api
```

### Error: "jq: command not found"

**Fix:**
```bash
brew install jq  # macOS
sudo apt-get install jq  # Linux
```

### Error: "Failed to fetch OpenAPI spec"

**Fix:**
1. Check internet connection
2. Verify production API is running:
   ```bash
   curl https://azure.aui.io/api/ia-controller/api/openapi.json
   ```

---

## 📚 More Information

- **Full documentation:** [README.md](./README.md)
- **5-minute setup:** [QUICK_SETUP.md](./QUICK_SETUP.md)
- **Jenkins setup:** [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md)
- **Project overview:** [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## 🎓 Examples for Different Scenarios

### Scenario 1: "I just want to test"

```bash
cd apollo-sdk
./generate-and-publish.sh --local-only
# Check generated-sdks/ folder
```

### Scenario 2: "I want to publish to production"

```bash
cd apollo-sdk
export NPM_TOKEN='...'
export PYPI_TOKEN='...'
./generate-and-publish.sh
```

### Scenario 3: "I want to check if everything works"

```bash
cd apollo-sdk
export NPM_TOKEN='...'
export PYPI_TOKEN='...'
./generate-and-publish.sh --dry-run
```

### Scenario 4: "DevOps automation"

See [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md) for Jenkins setup.

---

## ✨ Success!

If everything worked, you'll see:

```
✨ SDK Generation Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary:
   ✅ Fetched OpenAPI from production
   ✅ Filtered external endpoints
   ✅ Validated specifications
   ✅ Generated TypeScript SDK
   ✅ Generated Python SDK
   ✅ Published to npm
   ✅ Published to PyPI

🎉 All done!

📚 Installation commands:
   npm install @aui/apollo-sdk
   pip install aui-apollo-api
```

---

**Questions?** → #platform-team on Slack  
**Last Updated:** November 5, 2025

