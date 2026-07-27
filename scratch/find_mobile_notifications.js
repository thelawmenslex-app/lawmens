const fs = require('fs');
const path = require('path');

const DIR = "d:/projects/Thelawmens project code final/Thelawmen's_frontend/App";

function searchFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchFiles(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes('notification') || content.toLowerCase().includes('popup')) {
                console.log(`Found reference in: ${fullPath}`);
            }
        }
    }
}

searchFiles(DIR);
