const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = 'd:/projects/Thelawmens project code final/Thelawmen\'s_frontend/App';

function searchDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('axios(') || content.includes('axios.')) {
                console.log(`Axios in file: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('axios(') || line.includes('axios.')) {
                        console.log(`  Line ${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchDir(FRONTEND_DIR);
