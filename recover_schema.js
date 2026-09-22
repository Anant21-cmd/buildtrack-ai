const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
let latestEntry = null;
let latestTime = 0;
let cachedFile = '';

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
                    if (resource && resource.includes('BUILDTRACK-AI') && resource.endsWith('schema.prisma')) {
                        for (const entry of data.entries) {
                            if (entry.timestamp > latestTime) {
                                latestTime = entry.timestamp;
                                latestEntry = entry;
                                cachedFile = path.join(fullPath, entry.id);
                            }
                        }
                    }
                } catch (e) {}
            }
        }
    }
}

scanDir(historyDir);

if (cachedFile) {
    console.log('Recovering schema.prisma from:', cachedFile);
    const dest = path.join('c:\\anti pro\\BUILDTRACK-AI\\server\\prisma\\schema.prisma');
    fs.copyFileSync(cachedFile, dest);
    console.log('Success!');
} else {
    console.log('Not found.');
}

