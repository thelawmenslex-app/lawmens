const fs = require('fs');
const path = require('path');

function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                search(fullPath);
            }
        } else if (file.endsWith('.js')) {
            if (file.includes('cron') || file.includes('scheduler')) {
                console.log(`Found cron file: ${fullPath}`);
            }
        }
    }
}

search("d:/projects/Thelawmens project code final/lawapp (1)/lawapp");
process.exit(0);
