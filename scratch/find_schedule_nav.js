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
            if (content.includes('navigate("Schedule"') || content.includes("navigate('Schedule'") || content.includes('navigate("FirstSchedule"') || content.includes("navigate('FirstSchedule'")) {
                console.log(`Found navigation in: ${fullPath}`);
            }
        }
    }
}

search("d:/projects/Thelawmens project code final/Thelawmen's_frontend");
process.exit(0);
