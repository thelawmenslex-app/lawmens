const fs = require('fs');

const file = "d:/projects/Thelawmens project code final/lawapp (1)/lawapp/admin-next/app/books/page.jsx";
if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    console.log("File length:", lines.length);
    
    // Print lines around 880-920 with line numbers
    for (let i = 850; i < Math.min(1050, lines.length); i++) {
        console.log(`${i+1}: ${lines[i]}`);
    }
} else {
    console.log("File not found");
}
