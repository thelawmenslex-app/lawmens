const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const filePath = path.join(__dirname, "../CrPC.pdf");
// Let's see if we can locate a sample PDF or just inspect the PDFParse class signature
console.log("PDFParse class string:", pdf.PDFParse.toString());

// Let's check if the module has a default extract method or how to instantiate PDFParse
try {
    const parser = new pdf.PDFParse();
    console.log("Instantiated parser methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
} catch (e) {
    console.error("Instantiation failed:", e.message);
}
process.exit(0);
