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
            if (content.includes('firstschedule') || content.includes('getLegalEntries') || content.includes('FirstSchedule') || content.includes('SecondSchedule')) {
                console.log(`Found in: ${fullPath}`);
            }
        }
    }
}

search("d:/projects/Thelawmens project code final/Thelawmen's_frontend");
process.exit(0);
