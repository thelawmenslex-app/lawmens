const fs = require('fs');
const path = require('path');

const DIR_MOBILE = "d:/projects/Thelawmens project code final/Thelawmen's_frontend";

const files = [
    'App/Screens/Splash/splash.js',
    'App/Screens/Welcome/welcome.js',
    'App/Screens/Home/home.js',
    'App/Screens/Auth/login.js'
];

files.forEach(f => {
    const fullPath = path.join(DIR_MOBILE, f);
    if (fs.existsSync(fullPath)) {
        console.log(`=== File: ${f} ===`);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.includes('Alert.alert') || line.includes('Modal') || line.includes('api') || line.includes('get') || line.includes('fetch') || line.includes('post')) {
                console.log(`  Line ${idx + 1}: ${line.trim()}`);
            }
        });
    } else {
        console.log(`File not found: ${f}`);
    }
});
