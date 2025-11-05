# Apollo SDK - DevOps Integration Guide

**For:** DevOps Team  
**Purpose:** Jenkins/CI/CD setup for automated SDK generation

---

## 🎯 Overview

This guide explains how to set up automated SDK generation and publishing in Jenkins.

**What it does:**
- Fetches OpenAPI from production (https://azure.aui.io/api/ia-controller/api/openapi.json)
- Filters external-only endpoints
- Generates TypeScript and Python SDKs using Fern
- Publishes to npm (@aui/apollo-sdk) and PyPI (aui-apollo-api)

**Frequency:** Recommended daily or on-demand

---

## 📋 Prerequisites

### 1. Jenkins Node Requirements

The Jenkins node must have:
- **Node.js 18+** with npm
- **jq** (JSON processor)
- **curl**
- **Fern CLI:** `npm install -g fern-api`

### 2. Required Credentials in Jenkins

Add these as **Secret Text** credentials:

| Credential ID | Type | Description | How to Get |
|---------------|------|-------------|------------|
| `npm-publish-token` | Secret Text | npm publish token | https://www.npmjs.com/ → Settings → Access Tokens |
| `pypi-publish-token` | Secret Text | PyPI publish token | https://pypi.org/ → Settings → API tokens |
| `slack-webhook-url` | Secret Text | Slack notifications (optional) | Slack → Apps → Incoming Webhooks |

### 3. Network Access

Jenkins node must have access to:
- `https://azure.aui.io` (production API)
- `https://registry.npmjs.org` (npm publishing)
- `https://upload.pypi.org` (PyPI publishing)

---

## 🚀 Jenkins Pipeline Setup

### Option 1: Jenkinsfile (Recommended)

Create a new Pipeline job in Jenkins:

**Location:** `aui-common-services/apollo-sdk/Jenkinsfile`

```groovy
pipeline {
    agent {
        label 'node18'  // Or any node with Node.js 18+
    }
    
    environment {
        NPM_TOKEN = credentials('npm-publish-token')
        PYPI_TOKEN = credentials('pypi-publish-token')
    }
    
    triggers {
        // Run daily at 2 AM
        cron('0 2 * * *')
    }
    
    parameters {
        choice(
            name: 'MODE',
            choices: ['publish', 'dry-run', 'local-only'],
            description: 'Execution mode'
        )
    }
    
    stages {
        stage('Setup') {
            steps {
                echo 'Checking dependencies...'
                sh '''
                    node --version
                    npm --version
                    jq --version
                    curl --version
                    fern --version || npm install -g fern-api
                '''
            }
        }
        
        stage('Generate and Publish SDKs') {
            steps {
                dir('apollo-sdk') {
                    script {
                        def mode_flag = ''
                        if (params.MODE == 'dry-run') {
                            mode_flag = '--dry-run'
                        } else if (params.MODE == 'local-only') {
                            mode_flag = '--local-only'
                        }
                        
                        sh """
                            export NPM_TOKEN="\${NPM_TOKEN}"
                            export PYPI_TOKEN="\${PYPI_TOKEN}"
                            ./generate-and-publish.sh ${mode_flag}
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'SDK generation completed successfully'
            // Optional: Slack notification
            // slackSend(
            //     channel: '#sdk-updates',
            //     color: 'good',
            //     message: "✅ Apollo SDKs published successfully\nBuild: ${env.BUILD_URL}"
            // )
        }
        
        failure {
            echo 'SDK generation failed'
            // Optional: Slack notification
            // slackSend(
            //     channel: '#sdk-updates',
            //     color: 'danger',
            //     message: "❌ Apollo SDK generation failed\nBuild: ${env.BUILD_URL}\nCheck logs: ${env.BUILD_URL}console"
            // )
            
            // Send email to team
            emailext(
                subject: "Apollo SDK Generation Failed - Build #${env.BUILD_NUMBER}",
                body: """
                    SDK generation failed in Jenkins.
                    
                    Build: ${env.BUILD_URL}
                    Console Output: ${env.BUILD_URL}console
                    
                    Please review the logs and fix the issue.
                """,
                to: 'platform-team@aui.io'
            )
        }
        
        always {
            // Archive logs
            archiveArtifacts(
                artifacts: 'apollo-sdk/specs/*.json',
                allowEmptyArchive: true
            )
        }
    }
}
```

### Option 2: Freestyle Job

If you prefer a Freestyle project:

1. **Source Code Management:** Git → aui-common-services
2. **Build Triggers:** 
   - Build periodically: `H 2 * * *` (daily at 2 AM)
3. **Build Environment:**
   - Use secret text(s): `NPM_TOKEN`, `PYPI_TOKEN`
4. **Build Steps:**
   - Execute Shell:
     ```bash
     cd apollo-sdk
     export NPM_TOKEN="${NPM_TOKEN}"
     export PYPI_TOKEN="${PYPI_TOKEN}"
     ./generate-and-publish.sh
     ```
5. **Post-build Actions:**
   - Slack notifications
   - Email notifications on failure

---

## 📅 Recommended Schedules

### Option A: Daily (Recommended)

```groovy
triggers {
    cron('0 2 * * *')  // Daily at 2 AM
}
```

**Pros:**
- Regular updates
- Low risk of conflicts
- Predictable schedule

**Cons:**
- May publish when no changes

### Option B: Multiple Times Per Day

```groovy
triggers {
    cron('0 */6 * * *')  // Every 6 hours
}
```

**Pros:**
- Faster propagation of API changes
- More responsive to updates

**Cons:**
- More frequent builds
- Higher resource usage

### Option C: On-Demand Only

No triggers, manual execution only.

**Pros:**
- Full control over when SDKs are published
- No unnecessary builds

**Cons:**
- Requires manual intervention
- Risk of forgetting to run

**Recommendation:** Start with daily (Option A), adjust based on needs.

---

## 🧪 Testing the Pipeline

### 1. Dry Run Test

Test without publishing:

```bash
# In Jenkins, set MODE parameter to 'dry-run'
# Or manually:
cd apollo-sdk
./generate-and-publish.sh --dry-run
```

### 2. Local Generation Test

Generate SDKs locally without npm/PyPI:

```bash
# In Jenkins, set MODE parameter to 'local-only'
# Or manually:
cd apollo-sdk
./generate-and-publish.sh --local-only
```

### 3. Full Pipeline Test

Run the full pipeline with publishing:

```bash
# Ensure credentials are set
export NPM_TOKEN='...'
export PYPI_TOKEN='...'

cd apollo-sdk
./generate-and-publish.sh
```

---

## 🔍 Monitoring & Alerts

### Key Metrics to Track

1. **Build Success Rate**
   - Target: >95%
   - Alert if: <90% in last 7 days

2. **Build Duration**
   - Expected: 3-5 minutes
   - Alert if: >10 minutes

3. **Failure Reasons**
   - Track common failures
   - Address patterns

### Recommended Alerts

**Critical (Immediate):**
- Pipeline fails 2+ times in a row
- Cannot fetch OpenAPI from production
- Publishing to npm/PyPI fails

**Warning (Review within 24h):**
- Build takes >10 minutes
- OpenAPI spec has breaking changes

**Info:**
- New SDK version published
- New endpoints added

---

## 🐛 Troubleshooting

### Issue: "fern: command not found"

**Solution:**
```bash
# Add to Jenkinsfile setup stage
sh 'npm install -g fern-api'
```

Or install globally on Jenkins node.

### Issue: "Missing required environment variables"

**Solution:**
1. Verify credentials exist in Jenkins:
   - Manage Jenkins → Credentials
   - Check IDs match: `npm-publish-token`, `pypi-publish-token`
2. Verify environment block in Jenkinsfile:
   ```groovy
   environment {
       NPM_TOKEN = credentials('npm-publish-token')
       PYPI_TOKEN = credentials('pypi-publish-token')
   }
   ```

### Issue: "Failed to fetch OpenAPI spec"

**Solution:**
1. Check network connectivity:
   ```bash
   curl -I https://azure.aui.io/api/ia-controller/api/openapi.json
   ```
2. Verify Jenkins node has internet access
3. Check for firewall rules blocking outbound requests
4. Verify production API is running

### Issue: "npm publish failed: 403 Forbidden"

**Solution:**
1. Verify npm token is valid:
   ```bash
   curl -H "Authorization: Bearer $NPM_TOKEN" https://registry.npmjs.org/-/whoami
   ```
2. Check token has publish permissions for `@aui` scope
3. Regenerate token if needed (npmjs.com → Settings → Access Tokens)

### Issue: "PyPI upload failed"

**Solution:**
1. Verify PyPI token is valid
2. Check package name `aui-apollo-api` is registered
3. Ensure token has upload permissions
4. Check for duplicate version (PyPI doesn't allow re-uploading same version)

---

## 📊 Expected Output

### Successful Build

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 STEP 0: Pre-flight Checks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Checking dependencies...
✅ Checking environment variables...
✅ All pre-flight checks passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 STEP 1: Fetching OpenAPI from Production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Fetching OpenAPI spec from production...
✅ Successfully fetched OpenAPI spec
📊 Version: 0.5.2
📊 Total endpoints: 150

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 STEP 2: Filtering External Endpoints
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Found 4 external API endpoints
✅ Collected 25 schemas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ STEP 3: Validating API Specifications
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ OpenAPI spec is valid

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 STEP 4: Generating SDKs with Fern
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Fern configuration is valid

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 STEP 5: Publishing SDKs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SDKs published successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ SDK Generation Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Build Duration

- **Expected:** 3-5 minutes
- **Steps breakdown:**
  - Fetch OpenAPI: ~10 seconds
  - Filter & validate: ~5 seconds
  - Generate SDKs: 2-3 minutes
  - Publish: 1-2 minutes

---

## 🔐 Security Best Practices

1. **Never commit tokens to git**
   - Always use Jenkins credentials
   - Never echo tokens in logs

2. **Rotate tokens regularly**
   - npm tokens: Every 90 days
   - PyPI tokens: Every 90 days

3. **Use least-privilege tokens**
   - npm: Grant publish access only to `@aui/apollo-sdk`
   - PyPI: Grant upload access only to `aui-apollo-api`

4. **Audit access**
   - Review who has access to Jenkins credentials
   - Monitor npm/PyPI package downloads

---

## 📞 Support & Escalation

| Issue | Contact |
|-------|---------|
| Jenkins setup | DevOps Team (#devops) |
| SDK generation errors | Platform Team (#platform-team) |
| Fern issues | Platform Team + Fern documentation |
| npm/PyPI publishing | DevOps Team + Platform Team |
| API changes causing failures | API Team |

---

## 📝 Checklist for DevOps

- [ ] Jenkins node has Node.js 18+ installed
- [ ] Jenkins node has jq installed
- [ ] Jenkins node has Fern CLI installed
- [ ] Jenkins credentials created (`npm-publish-token`, `pypi-publish-token`)
- [ ] Network access verified (azure.aui.io, npm, PyPI)
- [ ] Jenkinsfile created and committed
- [ ] Pipeline job created in Jenkins
- [ ] Dry run test completed successfully
- [ ] Full pipeline test completed successfully
- [ ] Schedule configured (daily recommended)
- [ ] Slack notifications configured (optional)
- [ ] Email notifications configured
- [ ] Monitoring/alerts set up
- [ ] Team notified of automation

---

**Last Updated:** November 5, 2025  
**Maintained By:** DevOps Team + Platform Team  
**Review Frequency:** Monthly

