const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
const targetFiles = [
    'MarketPriceContext.jsx',
    'marketPriceController.js',
    'marketPriceRoutes.js',
    'MaterialReceiving.jsx',
    'main.jsx',
    'App.jsx',
    'server.js',
    'AuthContext.jsx',
    'Login.jsx',
    'append-schema.js',
    'fix-app.js',
    'fix-dash.js',
    'fix-poc.js',
    'fix-receipt.js',
    'fix-schema.js',
    'fix-vc.js',
    'fix_env.cjs',
    'fix_store.cjs',
    'fix_worker.cjs',
    'fix_worker_get.cjs',
    'add_demos.cjs',
    'check-error.cjs',
    'patch_login.cjs'
];

const found = {};

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const folders = fs.readdirSync(dir);
    for (const folder of folders) {
        const fullPath = path.join(dir, folder);
        if (fs.statSync(fullPath).isDirectory()) {
            const entriesFile = path.join(fullPath, 'entries.json');
            if (fs.existsSync(entriesFile)) {
                try {
                    const data = JSON.parse(fs.readFileSync(entriesFile, 'utf8'));
                    const resource = data.resource; // e.g. "file:///c%3A/anti%20pro/BUILDTRACK-AI/..."
                    if (!resource) continue;
                    
                    const fileName = decodeURIComponent(resource.split('/').pop());
                    
                    if (targetFiles.includes(fileName) && resource.includes('BUILDTRACK-AI')) {
                        // Find the latest entry
                        let latestEntry = null;
                        let latestTime = 0;
                        for (const entry of data.entries) {
                            if (entry.timestamp > latestTime) {
                                latestTime = entry.timestamp;
                                latestEntry = entry;
                            }
                        }
                        if (latestEntry) {
                            const cachedFile = path.join(fullPath, latestEntry.id);
                            if (!found[fileName] || latestTime > found[fileName].timestamp) {
                                found[fileName] = {
                                    originalPath: decodeURIComponent(resource.replace('file:///', '').replace('file://', '')).replace(/\//g, '\\'),
                                    cachedPath: cachedFile,
                                    timestamp: latestTime
                                };
                            }
                        }
                    }
                } catch (e) {}
            }
        }
    }
}

scanDir(historyDir);

for (const [name, info] of Object.entries(found)) {
    console.log(`RECOVERING: ${name}`);
    console.log(`FROM: ${info.cachedPath}`);
    console.log(`TO: ${info.originalPath}`);
    try {
        const content = fs.readFileSync(info.cachedPath, 'utf8');
        // We will just copy it over if it belongs to BUILDTRACK-AI
        if (info.originalPath.includes('BUILDTRACK-AI')) {
            // Ensure directory exists
            const dir = path.dirname(info.originalPath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(info.originalPath, content, 'utf8');
            console.log('SUCCESS');
        } else {
            console.log('SKIPPED (Not in BUILDTRACK-AI)');
        }
    } catch(err) {
        console.log('ERROR:', err.message);
    }
    console.log('---');
}
