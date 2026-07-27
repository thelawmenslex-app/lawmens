const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
const filePath = path.join(__dirname, 'mock_doc.pdf');
const writeStream = fs.createWriteStream(filePath);

doc.pipe(writeStream);
doc.fontSize(25).text('CHAPTER I', 100, 100);
doc.fontSize(15).text('Section 1. Short Title and extent.', 100, 150);
doc.fontSize(12).text('This is a test legal document text parsing mock file.', 100, 200);
doc.end();

writeStream.on('finish', () => {
    console.log('Mock PDF created successfully!');
    process.exit(0);
});
