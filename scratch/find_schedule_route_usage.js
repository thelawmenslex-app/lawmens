const fs = require('fs');

const appFile = "d:/projects/Thelawmens project code final/lawapp (1)/lawapp/app.js";
if (fs.existsSync(appFile)) {
    const content = fs.readFileSync(appFile, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (line.includes('firstschedule') || line.includes('firstSchedule')) {
            console.log(`Line ${idx + 1}: ${line.trim()}`);
        }
    });
} else {
    console.log("app.js not found");
}
