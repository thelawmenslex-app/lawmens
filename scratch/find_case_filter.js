const fs = require('fs');
const content = fs.readFileSync('d:/projects/Thelawmens project code final/lawapp (1)/lawapp/src/casebook/casebook.controller.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('caseFilter')) {
        console.log(`Line ${idx + 1}: ${line}`);
    }
});
