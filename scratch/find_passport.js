const fs = require('fs');
const path = require('path');

const DIR = 'd:/projects/Thelawmens project code final/lawapp (1)/lawapp';

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                searchFiles(fullPath);
            }
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('passport') && content.includes('Jwt')) {
                console.log(`Found passport config in: ${fullPath}`);
            }
        }
    }
}

searchFiles(DIR);
