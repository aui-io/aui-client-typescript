const fs = require('fs');
const path = require('path');

console.log('🔍 Filtering external API endpoints...\n');

// Read the full OpenAPI spec
const openApiPath = path.join(__dirname, '../specs/openapi.json');
const openApi = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));

// Filter only external endpoints (paths containing /external/)
const externalPaths = {};
for (const [pathKey, pathItem] of Object.entries(openApi.paths || {})) {
    if (pathKey.includes('/external/')) {
        externalPaths[pathKey] = pathItem;
    }
}

console.log(`✅ Found ${Object.keys(externalPaths).length} external API endpoints:`);
Object.keys(externalPaths).forEach(pathKey => console.log(`   - ${pathKey}`));

// Collect all schema references used by external endpoints
const usedSchemas = new Set();

function collectSchemaRefs(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.$ref) {
        const schemaName = obj.$ref.replace('#/components/schemas/', '');
        usedSchemas.add(schemaName);
    }
    
    if (Array.isArray(obj)) {
        obj.forEach(item => collectSchemaRefs(item));
    } else {
        Object.values(obj).forEach(value => collectSchemaRefs(value));
    }
}

// Collect all references from external paths
collectSchemaRefs(externalPaths);

// Recursively collect referenced schemas (schemas might reference other schemas)
let previousSize = 0;
while (usedSchemas.size > previousSize) {
    previousSize = usedSchemas.size;
    const currentSchemas = Array.from(usedSchemas);
    
    currentSchemas.forEach(schemaName => {
        const schema = openApi.components?.schemas?.[schemaName];
        if (schema) {
            collectSchemaRefs(schema);
        }
    });
}

console.log(`\n✅ Collected ${usedSchemas.size} schemas used by external endpoints`);

// Build the external-only OpenAPI spec
const externalOpenApi = {
    openapi: openApi.openapi,
    info: {
        ...openApi.info,
        title: openApi.info.title + ' - External API',
        description: 'External API endpoints only'
    },
    servers: [
        {
            url: 'https://azure.aui.io/api/ia-controller',
            description: 'Production server'
        }
    ],
    paths: externalPaths,
    components: {
        schemas: {},
        securitySchemes: openApi.components?.securitySchemes || {}
    }
};

// Add only the used schemas
if (openApi.components?.schemas) {
    usedSchemas.forEach(schemaName => {
        if (openApi.components.schemas[schemaName]) {
            externalOpenApi.components.schemas[schemaName] = openApi.components.schemas[schemaName];
        }
    });
}

// Write the filtered OpenAPI spec
const outputPath = path.join(__dirname, '../specs/external-openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(externalOpenApi, null, 2));

console.log(`\n✅ External API spec written to: specs/external-openapi.json`);
console.log(`   - ${Object.keys(externalPaths).length} endpoints`);
console.log(`   - ${usedSchemas.size} schemas`);

// Show comparison
const originalSize = JSON.stringify(openApi).length;
const externalSize = JSON.stringify(externalOpenApi).length;
const reduction = ((1 - externalSize / originalSize) * 100).toFixed(1);

console.log(`\n📊 Size comparison:`);
console.log(`   - Original: ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`   - External: ${(externalSize / 1024).toFixed(2)} KB`);
console.log(`   - Reduction: ${reduction}%\n`);

