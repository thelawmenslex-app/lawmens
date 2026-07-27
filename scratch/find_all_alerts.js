const fs = require('fs');
const path = require('path');

const DIR_MOBILE = "d:/projects/Thelawmens project code final/Thelawmen's_frontend/App";

function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Alert.alert') || content.includes('<Modal')) {
                console.log(`Alert/Modal in: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('Alert.alert') || line.includes('<Modal')) {
                        console.log(`  Line ${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchDir(DIR_MOBILE);
