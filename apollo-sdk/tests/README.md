# Apollo SDK Test Projects

Simple test projects to verify the generated SDKs work correctly.

## TypeScript Test

### Setup
```bash
cd tests/typescript
npm install
```

### Run
```bash
# Use default values
npm test

# Or with custom values
API_KEY='your-api-key' USER_ID='your-user-id' BASE_URL='https://api-staging.internal-aui.io/ia-controller' npm test
```

## Python Test

### Setup
```bash
cd tests/python
pip install -r requirements.txt
pip install -e ../../generated-sdks/python
```

### Run
```bash
# Use default values
python test_tasks.py

# Or with custom values
API_KEY='your-api-key' USER_ID='your-user-id' BASE_URL='https://api-staging.internal-aui.io/ia-controller' python test_tasks.py
```

## Environment Variables

- `API_KEY`: Your API key (default: test key)
- `USER_ID`: User ID to fetch tasks for (default: 'test-user-123')
- `BASE_URL`: Base URL for the API (default: staging URL)

