const fs = require('fs');
const file = "d:/projects/Thelawmens project code final/lawapp (1)/lawapp/node_modules/pdf-parse/package.json";
if (fs.existsSync(file)) {
    console.log(fs.readFileSync(file, 'utf8'));
} else {
    console.log("File not found");
}
