const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
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
                    const resource = data.resource;
                    if (!resource) continue;
                    
                    if (resource.includes('BUILDTRACK-AI')) {
                        const originalPath = decodeURIComponent(resource.replace('file:///', '').replace('file://', '')).replace(/\//g, '\\');
                        
                        // We only care about src/ or prisma/ files
                        if (!originalPath.includes('\\src\\') && !originalPath.includes('\\prisma\\') && !originalPath.includes('fix-') && !originalPath.includes('patch') && !originalPath.includes('append')) {
                           continue;
                        }

                        let latestEntry = null;
                        let latestTime = 0;
                        for (const entry of data.entries) {
                            if (entry.timestamp > latestTime) {
                                latestTime = entry.timestamp;
                                latestEntry = entry;
                            }
                        }
                        
                        if (latestEntry) {
                            found[originalPath] = {
                                cachedPath: path.join(fullPath, latestEntry.id),
                                timestamp: latestTime
                            };
                        }
                    }
                } catch (e) {}
            }
        }
    }
}

scanDir(historyDir);

let count = 0;
for (const [originalPath, info] of Object.entries(found)) {
    try {
        const content = fs.readFileSync(info.cachedPath, 'utf8');
        const dir = path.dirname(originalPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // If the file exists, we check if the history version is different
        // Actually, let's just overwrite them all because the git reset reverted them ALL.
        fs.writeFileSync(originalPath, content, 'utf8');
        console.log('RECOVERED:', originalPath);
        count++;
    } catch(err) {
        console.log('ERROR:', err.message);
    }
}
console.log('Total files recovered:', count);

