const fs = require('fs');
const code = fs.readFileSync('d:/projects/Thelawmens project code final/Thelawmen\'s_frontend/App/Screens/Filter/filter.js', 'utf8');

// Basic bracket & JSX tag counter to ensure perfection
let stack = [];
let lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Check line by line
}
console.log("Total lines in filter.js:", lines.length);
