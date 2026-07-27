const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = "D:/projects/Thelawmens project code final/Law Books/BNSS.pdf";

if (fs.existsSync(pdfPath)) {
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log("Loaded PDF buffer, size:", dataBuffer.length);
    
    const parser = new pdfParse.PDFParse({ data: dataBuffer });
    parser.getText().then(parsedData => {
        const text = parsedData.text || '';
        console.log("PDF parsed successfully. Total text length:", text.length);
        
        // Find FIRST SCHEDULE and SECOND SCHEDULE indexes
        const textUpper = text.toUpperCase();
        let firstSchedIdx = textUpper.indexOf('FIRST SCHEDULE');
        if (firstSchedIdx === -1) {
            firstSchedIdx = textUpper.indexOf('THE FIRST SCHEDULE');
        }
        
        let secondSchedIdx = textUpper.indexOf('SECOND SCHEDULE');
        if (secondSchedIdx === -1) {
            secondSchedIdx = textUpper.indexOf('THE SECOND SCHEDULE');
        }
        
        console.log("First Schedule Index:", firstSchedIdx);
        console.log("Second Schedule Index:", secondSchedIdx);
        
        if (firstSchedIdx !== -1) {
            console.log("\n--- FIRST SCHEDULE SNIPPET ---");
            console.log(text.substring(firstSchedIdx, firstSchedIdx + 1000));
        }
        if (secondSchedIdx !== -1) {
            console.log("\n--- SECOND SCHEDULE SNIPPET ---");
            console.log(text.substring(secondSchedIdx, secondSchedIdx + 1000));
        }
    }).catch(err => {
        console.error(err);
    });
} else {
    console.log("File not found:", pdfPath);
}
