const fs = require('fs');
const path = require('path');

const DIR_ANDROID = "d:/projects/Thelawmens project code final/Thelawmen's_frontend/android";

function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchDir(fullPath);
        } else if (file.endsWith('.java') || file.endsWith('.kt') || file.endsWith('.xml') || file.endsWith('.gradle')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Firebase') || content.includes('Messaging') || content.includes('notification')) {
                console.log(`Found messaging reference in: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('Firebase') || line.includes('Messaging') || line.includes('notification')) {
                        console.log(`  Line ${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchDir(DIR_ANDROID);
