const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
const found = [];

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
                    
                    const fileName = decodeURIComponent(resource.split('/').pop());
                    
                    if (fileName === 'schema.prisma' && resource.includes('BUILDTRACK-AI')) {
                        found.push(resource);
                    }
                } catch (e) {}
            }
        }
    }
}

scanDir(historyDir);
console.log('Found schemas:', found);

