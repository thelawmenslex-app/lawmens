const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = "D:/projects/Thelawmens project code final/Law Books/BNSS.pdf";

if (fs.existsSync(pdfPath)) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new pdfParse.PDFParse({ data: dataBuffer });
    parser.getText().then(parsedData => {
        const text = parsedData.text || '';
        const pages = text.split(/-- \d+ of 297 --/);
        
        console.log("Total pages split:", pages.length);
        
        // Find pages that mention "THE SECOND SCHEDULE" or "SECOND SCHEDULE" after page 180
        for (let p = 180; p < pages.length; p++) {
            const pageUpper = pages[p].toUpperCase();
            if (pageUpper.includes('SECOND SCHEDULE') || pageUpper.includes('THE SECOND SCHEDULE')) {
                console.log(`Found mention on page ${p}:`);
                console.log(pages[p].substring(0, 500));
            }
        }
    }).catch(err => {
        console.error(err);
    });
} else {
    console.log("File not found");
}
