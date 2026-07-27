const fs = require('fs');
const path = require('path');

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
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes('firebase') || content.toLowerCase().includes('fcm') || content.toLowerCase().includes('admin.messaging') || content.toLowerCase().includes('sendmulticast') || content.toLowerCase().includes('sendtobans')) {
                console.log(`Found reference in backend: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.toLowerCase().includes('firebase') || line.toLowerCase().includes('fcm') || line.toLowerCase().includes('messaging')) {
                        console.log(`  Line ${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchDir(DIR_BACKEND);
