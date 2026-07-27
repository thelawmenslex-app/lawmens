const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function test() {
    try {
        const fileBuffer = fs.readFileSync(path.join(__dirname, "mock_doc.pdf"));
        const parser = new PDFParse({ data: fileBuffer });
        const result = await parser.getText();
        console.log("PDF parsed successfully!");
        console.log("Text length:", result.text.length);
        console.log("Snippet:", result.text.substring(0, 200));
        await parser.destroy();
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}

test();
