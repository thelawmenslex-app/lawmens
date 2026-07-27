const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = "D:/projects/Thelawmens project code final/Law Books/BNSS.pdf";

if (fs.existsSync(pdfPath)) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new pdfParse.PDFParse({ data: dataBuffer });
    parser.getText().then(parsedData => {
        const text = parsedData.text || '';
        const pages = text.split(/-- \d+ of 297 --/);
        
        console.log("Total pages:", pages.length);
        
        // Extract First Schedule text (pages 174 to 203)
        const firstSchedulePages = pages.slice(174, 204);
        const firstScheduleText = firstSchedulePages.join('\n');
        console.log("First Schedule pages count:", firstSchedulePages.length);
        console.log("First Schedule text length:", firstScheduleText.length);
        
        // Extract Second Schedule text (pages 204 to 276)
        const secondSchedulePages = pages.slice(204, 277);
        const secondScheduleText = secondSchedulePages.join('\n');
        console.log("Second Schedule pages count:", secondSchedulePages.length);
        console.log("Second Schedule text length:", secondScheduleText.length);
        
        // Split Second Schedule by "FORM No."
        // We want to capture the form number, e.g. "FORM No. 1"
        const formSplit = secondScheduleText.split(/FORM\s+No\.\s+(\d+)/gi);
        console.log("Form split parts:", formSplit.length);
        
        // The first part is the header before Form 1
        console.log("Header part:\n", formSplit[0].substring(0, 300));
        
        // Let's print Form 1
        if (formSplit.length > 2) {
            console.log("\n--- FORM 1 ---");
            console.log("Number:", formSplit[1]);
            console.log("Content:\n", formSplit[2].substring(0, 400));
        }
        if (formSplit.length > 4) {
            console.log("\n--- FORM 2 ---");
            console.log("Number:", formSplit[3]);
            console.log("Content:\n", formSplit[4].substring(0, 400));
        }
    }).catch(err => {
        console.error(err);
    });
} else {
    console.log("File not found");
}
