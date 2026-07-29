const babel = require('@babel/core');
const fs = require('fs');

try {
    const code = fs.readFileSync('d:/projects/Thelawmens project code final/Thelawmen\'s_frontend/App/Screens/Filter/filter.js', 'utf8');
    babel.transformSync(code, {
        presets: ['module:metro-react-native-babel-preset'],
        filename: 'filter.js'
    });
    console.log("filter.js JSX syntax is 100% VALID!");
} catch (e) {
    console.error("JSX Syntax Error in filter.js:", e.message);
}
