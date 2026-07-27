const fs = require('fs');
const file = "d:/projects/Thelawmens project code final/Thelawmen's_frontend/App/Screens/Home/BookOptions.js";
if (fs.existsSync(file)) {
    console.log(fs.readFileSync(file, 'utf8'));
} else {
    // maybe it is named differently or lowercase
    console.log("Not found at exact path");
}
