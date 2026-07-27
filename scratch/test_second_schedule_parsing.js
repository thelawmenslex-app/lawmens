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
        
        // Case-sensitive matching to avoid "Form No." mentions inside texts
        const formSplit = secondScheduleText.split(/FORM\s+No\.\s+(\d+[A-Z]?)/g);
        
        const forms = [];
        for (let i = 1; i < formSplit.length; i += 2) {
            const formNum = formSplit[i].trim();
            const rawBody = formSplit[i + 1].trim();
            const lines = rawBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length === 0) continue;
            
            let title = '';
            let contentStartIdx = 0;
            
            if (lines.length > 1 && (lines[1].startsWith('(') || lines[1].toLowerCase().includes('see section'))) {
                title = `${lines[0]} ${lines[1]}`;
                contentStartIdx = 2;
            } else {
                title = lines[0];
                contentStartIdx = 1;
            }
            
            const content = lines.slice(contentStartIdx).join('\n');
            forms.push({
                formNo: `Form ${formNum}`,
                title: title,
                content: content
            });
        }
        
        console.log("Total forms parsed:", forms.length);
        forms.forEach(f => {
            console.log(`${f.formNo}: ${f.title}`);
        });
    }).catch(err => {
        console.error(err);
    });
} else {
    console.log("File not found");
}
