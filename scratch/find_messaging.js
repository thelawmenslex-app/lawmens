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
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('messaging') || content.includes('fcm') || content.includes('Firebase') || content.includes('PushNotification')) {
                console.log(`Found messaging reference in: ${fullPath}`);
                // Print matching lines
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('messaging') || line.includes('fcm') || line.includes('Firebase') || line.includes('PushNotification')) {
                        console.log(`  Line ${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchDir(DIR_MOBILE);
