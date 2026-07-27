const fs = require('fs');

const file = "d:/projects/Thelawmens project code final/Thelawmen's_frontend/App/Screens/Home/home.js";
if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('modal') || line.toLowerCase().includes('alert') || line.toLowerCase().includes('popup') || line.toLowerCase().includes('msg') || line.toLowerCase().includes('message')) {
            console.log(`Line ${idx + 1}: ${line.trim()}`);
        }
    });
} else {
    console.log("File not found");
}
