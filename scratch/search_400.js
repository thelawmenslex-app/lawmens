const fs = require('fs');
const path = require('path');

const BACKEND_DIRS = [
    'd:/projects/Thelawmens project code final/lawapp (1)/lawapp/src',
    'd:/projects/Thelawmens project code final/lawapp (1)/lawapp/middleware'
];

function searchDir(dir, query) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchDir(fullPath, query);
        } else if (file.endsWith('.js')) {
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

for (const dir of BACKEND_DIRS) {
    searchDir(dir, '400');
    searchDir(dir, 'status(400)');
}
