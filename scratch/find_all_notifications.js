const fs = require('fs');
const path = require('path');

const DIR_MOBILE = "d:/projects/Thelawmens project code final/Thelawmen's_frontend";
const DIR_BACKEND = "d:/projects/Thelawmens project code final/lawapp (1)/lawapp";

function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                searchDir(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('notifications-outline') || content.includes('Notification') || content.includes('notification')) {
                // print line numbers
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('notifications-outline') || line.includes('Notification') || line.includes('notification')) {
                        console.log(`${fullPath}:${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

console.log("=== Searching Mobile ===");
searchDir(DIR_MOBILE);
console.log("=== Searching Backend ===");
searchDir(DIR_BACKEND);
