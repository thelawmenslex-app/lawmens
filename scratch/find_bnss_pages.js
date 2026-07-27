const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = "D:/projects/Thelawmens project code final/Law Books/BNSS.pdf";

if (fs.existsSync(pdfPath)) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new pdfParse.PDFParse({ data: dataBuffer });
    parser.getText().then(parsedData => {
        const text = parsedData.text || '';
        
        // Let's find pages. The pages seem to have markers like "-- PageNo of 297 --"
        // Let's split by this pattern: /-- \d+ of 297 --/
        const pages = text.split(/-- \d+ of 297 --/);
        console.log("Split into pages count:", pages.length);
        
        // Let's check page 175 (index 175 or 176)
        for (let p = 170; p <= 180; p++) {
            if (pages[p]) {
                console.log(`\n================ PAGE ${p} ================`);
                console.log(pages[p].substring(0, 800));
            }
        }
    }).catch(err => {
        console.error(err);
    });
} else {
    console.log("File not found");
}
