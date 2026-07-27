const PDFDocument = require('pdfkit');
const fs = require('fs');
// Function to generate the PDF
const  generatePDF=async (contents, outputFileName,chapter,section,title)=> {
    // Create a new PDF document
    const doc = new PDFDocument();

    // Create a writable stream to output to a file
    const outputStream = fs.createWriteStream(outputFileName);

    // Pipe the PDF content to the writable stream
    doc.pipe(outputStream);

    let isFirstPage = true;

    // Iterate through paragraphs and add to PDF
    contents.forEach((paragraph, index) => {
        // Add a new page for each paragraph after the first one
        if (!isFirstPage) {
            doc.addPage();
        } else {
            isFirstPage = false;
        }
        
        doc.font('Helvetica-Bold').text(chapter, { align: 'left' });
        doc.font('Helvetica-Bold').text(section, { align: 'left' });
        doc.font('Helvetica-Bold').text(title, { align: 'left' });

        doc.text("\n");
        // Add content to the current page
        doc.font('Helvetica').fontSize(12).text(paragraph.content, {
            align: 'left'
        });
        // Optionally add page numbers
        doc.text(`Page ${index+1}`, { align: 'right' });
    });

    // Finalize the PDF and end the stream
    doc.end();

    console.log(`PDF created successfully: ${outputFileName}`);
    // Output confirmation
    return outputFileName
}

module.exports={
    generatePDF
}
