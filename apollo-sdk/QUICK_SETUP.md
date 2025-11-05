# Apollo SDK - Quick Setup (5 Minutes)

Get up and running in 5 minutes! ⚡

---

## Step 1: Install Dependencies (2 min)

```bash
# Check if you have Node.js
node --version  # Need v18+

# Install Fern CLI
npm install -g fern-api

# Install jq (if not installed)
# macOS:
brew install jq

# Linux:
sudo apt-get install jq
```

---

## Step 2: Set Environment Variables (1 min)

```bash
# Get your tokens from:
# - npm: https://www.npmjs.com/ → Settings → Access Tokens
# - PyPI: https://pypi.org/ → Settings → API tokens

export NPM_TOKEN='your-npm-token-here'
export PYPI_TOKEN='your-pypi-token-here'
```

**💡 Tip:** Add these to your `~/.zshrc` or `~/.bashrc` to persist them.

---

## Step 3: Test Locally (1 min)

```bash
cd apollo-sdk

# Test without publishing (safe)
./generate-and-publish.sh --local-only
```

**Expected output:**
- ✅ Fetches OpenAPI from production
- ✅ Filters external endpoints
- ✅ Validates specs
- ✅ Generates SDKs to `generated-sdks/`

---

## Step 4: Verify Generated SDKs (1 min)

```bash
# Check TypeScript SDK
ls -la generated-sdks/typescript/

# Check Python SDK
ls -la generated-sdks/python/
```

You should see:
- `typescript/` with `package.json`, `src/`, etc.
- `python/` with `setup.py`, `aui_apollo_api/`, etc.

---

## Step 5: Publish (Optional)

Once you've verified locally:

```bash
./generate-and-publish.sh
```

This will publish to:
- npm: `@aui/apollo-sdk`
- PyPI: `aui-apollo-api`

---

## ✅ You're Done!

**Next steps:**
- Read [README.md](./README.md) for full documentation
- Read [DEVOPS_GUIDE.md](./DEVOPS_GUIDE.md) for Jenkins setup
- Set up automated runs in Jenkins

---

## 🆘 Need Help?

**Error: "fern: command not found"**
```bash
npm install -g fern-api
```

**Error: "jq: command not found"**
```bash
brew install jq  # macOS
sudo apt-get install jq  # Linux
```

**Error: "Missing required environment variables"**
```bash
# Make sure you exported the tokens:
export NPM_TOKEN='...'
export PYPI_TOKEN='...'

# Or run without publishing:
./generate-and-publish.sh --local-only
```

---

**Questions?** → #platform-team on Slack

