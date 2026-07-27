const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = "D:/projects/Thelawmens project code final/Law Books/BNSS.pdf";

if (fs.existsSync(pdfPath)) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new pdfParse.PDFParse({ data: dataBuffer });
    parser.getText().then(parsedData => {
        const text = parsedData.text || '';
        const pages = text.split(/-- \d+ of 297 --/);
        const secondSchedulePages = pages.slice(204, 277);
        const secondScheduleText = secondSchedulePages.join('\n');
        
        // Find all matches of FORM No.
        const regex = /FORM\s+No\.\s+(\d+)/gi;
        let match;
        while ((match = regex.exec(secondScheduleText)) !== null) {
            console.log(`Match: "${match[0]}" at index ${match.index}`);
            console.log("Context:\n", secondScheduleText.substring(Math.max(0, match.index - 50), Math.min(secondScheduleText.length, match.index + 100)));
            console.log("-----------------------------------------");
        }
    }).catch(err => {
        console.error(err);
    });
} else {
    console.log("File not found");
}
