const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');
const pdfParse = require('pdf-parse');

const FirstSchedule = require('../src/models/firstschedule');
const SecondSchedule = require('../src/models/secondschedule');
const Category = require('../src/models/category');

const dbUrl = "mongodb://duraigajendranoffical_db_user:1CEGLp3qQGzpcjkF@ac-zetttaf-shard-00-00.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-01.u5bqmpo.mongodb.net:27017,ac-zetttaf-shard-00-02.u5bqmpo.mongodb.net:27017/lawapp?ssl=true&replicaSet=atlas-ejpwfb-shard-0&authSource=admin&appName=Cluster0&compressors=zlib";
const groqApiKey = process.env.GROQ_API_KEY || "YOUR_GROQ_API_KEY";
const categoryId = "665752a184091c0faa66efe2"; // BNSS Category ID
const pdfPath = "D:/projects/Thelawmens project code final/Law Books/BNSS.pdf";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parseFirstScheduleChunk = async (chunkText, chunkIndex) => {
    console.log(`Calling Groq for First Schedule page ${chunkIndex}...`);
    const prompt = `You are a Principal Legal Document Architect. Parse the following First Schedule (Offences table) text page from the Bharatiya Nagarik Suraksha Sanhita (BNSS) and organize it into a structured JSON array of offence classification rows.
    Keep the original text word-for-word without any summarization, abbreviation, or changes.
    
    Response must be a pure JSON object containing a "firstSchedule" key with the array of offence objects. Do not wrap in markdown or backticks.
    
    JSON Schema:
    {
      "firstSchedule": [
        {
          "Section": "379",
          "Offence": "Theft",
          "Punishment": "Imprisonment for 3 years, or fine, or both",
          "Cognizable or Non- cognizable": "Cognizable",
          "Bailable or Non- bailable": "Non-bailable",
          "By what Court triable": "Any Magistrate"
        }
      ]
    }
    
    TEXT TO PARSE:
    ${chunkText}`;

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.1-8b-instant',
        messages: [
            { role: 'system', content: 'You extract legal schedule tables to JSON. Respond ONLY with valid JSON.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
    }, {
        headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
        }
    });

    let content = response.data.choices[0].message.content.trim();
    if (content.startsWith('```')) {
        content = content.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    }
    const parsed = JSON.parse(content);
    return parsed.firstSchedule || [];
};

const parseFirstScheduleChunkWithRetry = async (chunkText, chunkIndex) => {
    let retries = 5;
    let delay = 15000; // 15 seconds initial wait on rate limit
    while (retries > 0) {
        try {
            const rows = await parseFirstScheduleChunk(chunkText, chunkIndex);
            return rows;
        } catch (err) {
            const errorDetails = err.response ? JSON.stringify(err.response.data) : err.message;
            console.warn(`Page ${chunkIndex} failed: ${errorDetails}. Retrying in ${delay}ms... (${retries} retries left)`);
            retries--;
            await sleep(delay);
            delay += 10000; // increment delay by 10s
        }
    }
    throw new Error(`Failed to parse page ${chunkIndex} after multiple retries.`);
};

const runImport = async () => {
    if (!fs.existsSync(pdfPath)) {
        console.log("PDF file not found at:", pdfPath);
        return;
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB.");

    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new pdfParse.PDFParse({ data: dataBuffer });
    console.log("Parsing PDF text...");
    const parsedData = await parser.getText();
    const text = parsedData.text || '';
    const pages = text.split(/-- \d+ of 297 --/);
    console.log("Total PDF pages loaded:", pages.length);

    // ==========================================
    // 1. Process Second Schedule (Forms) - Programmatic
    // ==========================================
    console.log("Processing Second Schedule (Forms)...");
    const secondSchedulePages = pages.slice(204, 277);
    const secondScheduleText = secondSchedulePages.join('\n');
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
            categoryId,
            formNo: `Form ${formNum}`,
            title: title,
            content: content
        });
    }
    console.log(`Parsed ${forms.length} forms successfully.`);

    // Save Second Schedule to MongoDB
    console.log("Saving Second Schedule forms to database...");
    await SecondSchedule.deleteMany({ categoryId });
    if (forms.length > 0) {
        await SecondSchedule.insertMany(forms);
        console.log("Second Schedule forms saved successfully.");
    }

    // ==========================================
    // 2. Process First Schedule (Offences) - AI Page-by-Page
    // ==========================================
    console.log("Processing First Schedule (Offences)...");
    const firstSchedulePages = pages.slice(174, 204);
    console.log(`Extracting from ${firstSchedulePages.length} First Schedule pages...`);
    
    const firstScheduleRows = [];
    for (let i = 0; i < firstSchedulePages.length; i++) {
        const chunkText = firstSchedulePages[i];
        const pageNum = i + 1;
        
        try {
            const rows = await parseFirstScheduleChunkWithRetry(chunkText, pageNum);
            console.log(`Parsed ${rows.length} offence rows from page ${pageNum} / ${firstSchedulePages.length}.`);
            firstScheduleRows.push(...rows);
        } catch (err) {
            console.error(`Error parsing page ${pageNum}:`, err.message);
        }
        
        // Wait 10 seconds to keep tokens-per-minute rate under 6,000 TPM
        await sleep(10000);
    }

    // Map rows to correct Schema format
    const preparedFirst = firstScheduleRows.map(entry => {
        const sectionVal = entry.Section || entry.section || "";
        const offenceVal = entry.Offence || entry.offence || "";
        const punishmentVal = entry.Punishment || entry.punishment || "";
        
        const cognizableVal = entry['Cognizable or Non- cognizable'] || entry.Cognizable || entry.cognizable || "";
        const bailableVal = entry['Bailable or Non- bailable'] || entry.Bailable || entry.bailable || "";
        const courtVal = entry['By what Court triable'] || entry.Court || entry.court || "";

        return {
            categoryId,
            Section: String(sectionVal || "N/A").trim(),
            Offence: String(offenceVal || "N/A").trim(),
            Punishment: String(punishmentVal || "N/A").trim(),
            'Cognizable or Non- cognizable': String(cognizableVal || "Cognizable").trim(),
            'Bailable or Non- bailable': String(bailableVal || "Bailable").trim(),
            'By what Court triable': String(courtVal || "Any Magistrate").trim()
        };
    });

    console.log(`Saving ${preparedFirst.length} First Schedule offence rows to database...`);
    await FirstSchedule.deleteMany({ categoryId });
    if (preparedFirst.length > 0) {
        await FirstSchedule.insertMany(preparedFirst);
        console.log("First Schedule offence rows saved successfully.");
    }

    // Bump category updatedAt timestamp so that mobile client sync is triggered
    await Category.findByIdAndUpdate(categoryId, { updatedAt: new Date() });
    console.log("Category updated timestamp bumped.");

    await mongoose.disconnect();
    console.log("Database disconnected. Import complete!");
};

runImport().catch(err => {
    console.error("Import failed:", err);
    mongoose.disconnect();
});
