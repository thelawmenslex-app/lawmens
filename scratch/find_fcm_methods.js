const fs = require('fs');
const path = require('path');

const DIR_MOBILE = "d:/projects/Thelawmens project code final/Thelawmen's_frontend";

function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                searchDir(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.java') || file.endsWith('.kt')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes('initialnotification') || content.toLowerCase().includes('onmessage') || content.toLowerCase().includes('onnotification') || content.toLowerCase().includes('backgroundmessage')) {
                console.log(`Found FCM in: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.toLowerCase().includes('initialnotification') || line.toLowerCase().includes('onmessage') || line.toLowerCase().includes('onnotification') || line.toLowerCase().includes('backgroundmessage')) {
                        console.log(`  Line ${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchDir(DIR_MOBILE);
