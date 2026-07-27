const fs = require('fs');

const file = "d:/projects/Thelawmens project code final/lawapp (1)/lawapp/src/users/user.controller.js";
if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (line.includes('getProfile')) {
            console.log(`Line ${idx + 1}: ${line.trim()}`);
        }
    });
} else {
    console.log("File not found");
}
