const fs = require('fs');
const path = require('path');

function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.expo' && file !== 'android' && file !== 'ios') {
                search(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('getSchedule') && content.includes('http')) {
                console.log(`Found backendroutes in: ${fullPath}`);
            } else if (file.includes('constant.js') || file.includes('config.js') || file.includes('routes.js')) {
                if (content.includes('getSchedule') || content.includes('getSecondSchedule')) {
                    console.log(`Found config in: ${fullPath}`);
                }
            }
        }
    }
}

search("d:/projects/Thelawmens project code final/Thelawmen's_frontend");
process.exit(0);
