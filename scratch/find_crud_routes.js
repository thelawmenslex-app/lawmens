const fs = require('fs');
const path = require('path');

const FILES_TO_SEARCH = [
    'd:/projects/Thelawmens project code final/lawapp (1)/lawapp/src/casebook/casebook.route.js',
    'd:/projects/Thelawmens project code final/lawapp (1)/lawapp/src/casebook/casebook.controller.js',
    'd:/projects/Thelawmens project code final/lawapp (1)/lawapp/src/casebook/casebook.service.js'
];

FILES_TO_SEARCH.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`=== File: ${file} ===`);
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.includes('delete') || line.includes('update') || line.includes('edit') || line.includes('add') || line.includes('remove') || line.includes('destroy')) {
                console.log(`  Line ${idx + 1}: ${line.trim()}`);
            }
        });
    } else {
        console.log(`File not found: ${file}`);
    }
});
