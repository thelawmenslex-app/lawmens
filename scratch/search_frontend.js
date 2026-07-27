const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = 'd:/projects/Thelawmens project code final/Thelawmen\'s_frontend/App';

function searchDir(dir, query) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchDir(fullPath, query);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(query)) {
                console.log(`Found "${query}" in: ${fullPath}`);
                
                // Print surrounding lines
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes(query)) {
                        console.log(`  Line ${idx + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

searchDir(FRONTEND_DIR, 'initialfner');
searchDir(FRONTEND_DIR, 'initialfn');
